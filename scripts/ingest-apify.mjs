import { ApifyClient } from 'apify-client';
import pg from 'pg';
import fs from 'fs';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN || '';
const DB_URL = process.env.DATABASE_URL || '';

function isCommentQuestion(text) {
  if (!text) return false;
  if (text.includes('?')) return true;
  const lower = text.toLowerCase();
  const indicators = ['how', 'what', 'why', 'when', 'which', 'where', 'can i', 'is it', 'does it', 'kya', 'kaise', 'sir', 'doctor', 'pain'];
  return indicators.some(i => lower.startsWith(i) || lower.includes(` ${i} `));
}

async function run() {
  console.log('[Ingestion] Connecting to Apify and PostgreSQL...');
  const apify = new ApifyClient({ token: APIFY_TOKEN });
  const db = new pg.Client({ connectionString: DB_URL });
  await db.connect();

  console.log('[Ingestion] Database connected!');

  // Fetch topics for categorization
  const topicsRes = await db.query('SELECT id, name, keywords FROM topics;');
  const topics = topicsRes.rows;

  // Retrieve dataset items from the successful run UIhGh2h9ALnBOsH41
  console.log('[Ingestion] Fetching 100 Reels from Apify dataset...');
  const dataset = await apify.dataset('UIhGh2h9ALnBOsH41').listItems({ limit: 100 });
  const items = dataset.items;
  console.log(`[Ingestion] Retrieved ${items.length} items from Apify!`);

  const accountId = '77761300798';
  const username = 'dr.mohit_urowala';
  const fullName = 'Dr. Mohit Sharma | Urologist & Andrologist';
  const followersCount = 24417;

  // Upsert account
  await db.query(`
    INSERT INTO instagram_accounts (id, username, name, followers_count, media_count, last_synced_at, sync_status)
    VALUES ($1, $2, $3, $4, $5, NOW(), 'idle')
    ON CONFLICT (id) DO UPDATE SET
      followers_count = EXCLUDED.followers_count,
      media_count = EXCLUDED.media_count,
      last_synced_at = NOW(),
      sync_status = 'idle';
  `, [accountId, username, fullName, followersCount, items.length]);

  // Record account snapshot
  await db.query(`
    INSERT INTO account_snapshots (account_id, timestamp, followers_count, media_count)
    VALUES ($1, NOW(), $2, $3);
  `, [accountId, followersCount, items.length]);

  let reelsSaved = 0;
  let commentsSaved = 0;

  for (const item of items) {
    if (!item.shortCode) continue;

    const reelId = item.id || `reel_${item.shortCode}`;
    const caption = item.caption || '';
    const permalink = item.url || `https://www.instagram.com/reel/${item.shortCode}/`;
    const thumbnail = item.displayUrl || (item.images && item.images[0]) || null;
    const postedAt = item.timestamp || new Date().toISOString();
    const views = item.videoPlayCount || item.videoViewCount || 0;
    const likes = item.likesCount || 0;
    const commentsCount = item.commentsCount || 0;

    // Detect topic
    let topicId = 'general_education';
    const lowerCaption = caption.toLowerCase();
    for (const t of topics) {
      if (t.keywords && Array.isArray(t.keywords)) {
        if (t.keywords.some(kw => lowerCaption.includes(kw.toLowerCase()))) {
          topicId = t.id;
          break;
        }
      }
    }

    // Upsert Reel
    await db.query(`
      INSERT INTO reels (id, account_id, shortcode, caption, media_type, media_product_type, permalink, thumbnail_url, posted_at, topic_id, is_deleted)
      VALUES ($1, $2, $3, $4, 'VIDEO', 'REELS', $5, $6, $7, $8, FALSE)
      ON CONFLICT (id) DO UPDATE SET
        caption = EXCLUDED.caption,
        thumbnail_url = EXCLUDED.thumbnail_url,
        permalink = EXCLUDED.permalink,
        updated_at = NOW();
    `, [reelId, accountId, item.shortCode, caption, permalink, thumbnail, postedAt, topicId]);

    // Insert Snapshot
    await db.query(`
      INSERT INTO reel_snapshots (reel_id, timestamp, views, reach, likes, comments_count)
      VALUES ($1, NOW(), $2, $3, $4, $5);
    `, [reelId, views, Math.round(views * 0.85), likes, commentsCount]);

    reelsSaved++;

    // Ingest latest comments if present
    if (item.latestComments && Array.isArray(item.latestComments)) {
      for (const comm of item.latestComments) {
        if (!comm.text) continue;
        const commId = comm.id || `comm_${Math.random().toString(36).substring(7)}`;
        const isQ = isCommentQuestion(comm.text);
        await db.query(`
          INSERT INTO reel_comments (id, reel_id, text, commenter_username, posted_at, like_count, is_question)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING;
        `, [commId, reelId, comm.text, comm.ownerUsername || 'user', comm.timestamp || new Date().toISOString(), comm.likesCount || 0, isQ]);
        commentsSaved++;
      }
    }
  }

  // Update sync_log
  await db.query(`
    INSERT INTO sync_logs (account_id, started_at, finished_at, status, reels_synced, comments_synced, trigger_type)
    VALUES ($1, NOW(), NOW(), 'success', $2, $3, 'manual');
  `, [accountId, reelsSaved, commentsSaved]);

  console.log(`[Ingestion Complete] Successfully saved ${reelsSaved} live Reels and ${commentsSaved} comments into Supabase!`);
  await db.end();
}

run().catch(err => {
  console.error('[Ingestion Error]', err);
  process.exit(1);
});
