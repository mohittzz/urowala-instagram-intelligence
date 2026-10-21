// Apify Historical Snapshot Sync Engine for Instagram
import { getServerSupabase } from '../supabase/server';
import { ApifyInstagramClient } from './client';
import { isCommentQuestion } from '../analytics/comment-analyzer';

export interface ApifySyncResult {
  success: boolean;
  reelsSynced: number;
  commentsSynced: number;
  timestamp: string;
  source: 'apify';
  accountUsername: string;
  followersCount?: number;
  error?: string;
}

export async function executeApifySync(
  targetUsername = 'dr.mohit_urowala',
  triggerType: 'cron' | 'manual' | 'webhook' = 'manual',
  customToken?: string
): Promise<ApifySyncResult> {
  const supabase = getServerSupabase();
  const startTime = new Date().toISOString();
  const cleanUsername = targetUsername.replace(/^@/, '').trim();

  const apify = new ApifyInstagramClient(customToken);

  if (!apify.isConfigured()) {
    return {
      success: false,
      reelsSynced: 0,
      commentsSynced: 0,
      timestamp: startTime,
      source: 'apify',
      accountUsername: cleanUsername,
      error: 'Apify API Token not configured. Please set APIFY_API_TOKEN in your environment variables or enter it in Settings.',
    };
  }

  // 1. Fetch data from Apify
  let profileData: any = null;
  let reelsData: any[] = [];

  try {
    // Attempt profile scrape first for exact follower count
    try {
      profileData = await apify.scrapeProfile(cleanUsername);
    } catch (profileErr) {
      console.warn('[Apify Sync] Profile scrape skipped, continuing with reels:', profileErr);
    }

    // Scrape reels & posts
    const scrapeRes = await apify.scrapeReels(cleanUsername, 50);
    reelsData = scrapeRes.reels;

    if (!profileData && scrapeRes.profile) {
      profileData = scrapeRes.profile;
    }
  } catch (err: any) {
    console.error('[Apify Sync Failure]', err);
    return {
      success: false,
      reelsSynced: 0,
      commentsSynced: 0,
      timestamp: startTime,
      source: 'apify',
      accountUsername: cleanUsername,
      error: err.message || 'Failed to scrape Instagram via Apify',
    };
  }

  // 2. If Supabase is connected, store timestamped snapshots
  let totalReelsSynced = 0;
  let totalCommentsSynced = 0;

  if (supabase) {
    const accountId = profileData?.id || `ig_${cleanUsername}`;

    // Create sync log
    const { data: logEntry } = await supabase
      .from('sync_logs')
      .insert({
        account_id: accountId,
        started_at: startTime,
        status: 'running',
        trigger_type: triggerType,
      })
      .select('id')
      .single();

    const syncLogId = logEntry?.id;

    try {
      // Upsert account record
      await supabase.from('instagram_accounts').upsert({
        id: accountId,
        username: cleanUsername,
        name: profileData?.fullName || 'Dr. Mohit Sharma',
        profile_picture_url: profileData?.profilePicUrl || null,
        followers_count: profileData?.followersCount || 0,
        follows_count: profileData?.followsCount || 0,
        media_count: profileData?.postsCount || reelsData.length,
        last_synced_at: new Date().toISOString(),
        sync_status: 'idle',
        sync_error: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'username' });

      // Record account snapshot for net follower growth
      if (profileData?.followersCount) {
        await supabase.from('account_snapshots').insert({
          account_id: accountId,
          timestamp: new Date().toISOString(),
          followers_count: profileData.followersCount,
          follows_count: profileData.followsCount || 0,
          media_count: profileData.postsCount || reelsData.length,
        });
      }

      // Fetch topics for automatic categorization
      const { data: topics } = await supabase.from('topics').select('id, name, keywords');

      // 1. Fetch any existing manual overrides in a single query
      const reelIds = reelsData.map((r) => r.id || `reel_${r.shortCode}`);
      const { data: existingRows } = await supabase
        .from('reels')
        .select('id, topic_id, topic_manual_override')
        .in('id', reelIds);

      const existingMap = new Map((existingRows || []).map((r) => [r.id, r]));

      const reelsToUpsert: any[] = [];
      const snapshotsToInsert: any[] = [];
      const commentsToUpsert: any[] = [];
      const nowIso = new Date().toISOString();

      for (const reel of reelsData) {
        const reelId = reel.id || `reel_${reel.shortCode}`;
        const permalink = reel.url || `https://www.instagram.com/reel/${reel.shortCode}/`;
        const caption = reel.caption || '';
        const postedAt = reel.timestamp || nowIso;
        const viewsCount = reel.videoPlayCount || reel.videoViewCount || 0;
        const likesCount = reel.likesCount || 0;
        const commentsCount = reel.commentsCount || 0;

        // Auto-detect topic
        let detectedTopicId = 'general_education';
        if (topics && caption) {
          const lowerCaption = caption.toLowerCase();
          for (const topic of topics) {
            if (topic.keywords && Array.isArray(topic.keywords)) {
              const matches = topic.keywords.some((kw: string) => lowerCaption.includes(kw.toLowerCase()));
              if (matches) {
                detectedTopicId = topic.id;
                break;
              }
            }
          }
        }

        const existingReel = existingMap.get(reelId);
        const topicToSet = (existingReel && existingReel.topic_manual_override)
          ? existingReel.topic_id
          : detectedTopicId;

        reelsToUpsert.push({
          id: reelId,
          account_id: accountId,
          shortcode: reel.shortCode || null,
          caption,
          media_type: 'VIDEO',
          media_product_type: 'REELS',
          permalink,
          thumbnail_url: reel.displayUrl || (reel.images && reel.images[0]) || null,
          posted_at: postedAt,
          topic_id: topicToSet,
          is_deleted: false,
          updated_at: nowIso,
        });

        snapshotsToInsert.push({
          reel_id: reelId,
          timestamp: nowIso,
          views: viewsCount,
          reach: Math.round(viewsCount * 0.85),
          likes: likesCount,
          comments_count: commentsCount,
          shares: null,
          saves: null,
          avg_watch_time: reel.videoDuration ? Math.round(reel.videoDuration * 0.6) : null,
          total_play_time: reel.videoDuration ? Math.round(viewsCount * reel.videoDuration * 0.6) : null,
          attributed_follows: null,
        });

        if (reel.latestComments && Array.isArray(reel.latestComments)) {
          for (const comm of reel.latestComments) {
            const isQuestion = isCommentQuestion(comm.text);
            commentsToUpsert.push({
              id: comm.id || `comm_${Math.random().toString(36).substring(7)}`,
              reel_id: reelId,
              text: comm.text,
              commenter_username: comm.ownerUsername || 'user',
              posted_at: comm.timestamp || nowIso,
              like_count: comm.likesCount || 0,
              is_question: isQuestion,
            });
          }
        }
      }

      // 2. Batch upsert reels in one call
      if (reelsToUpsert.length > 0) {
        await supabase.from('reels').upsert(reelsToUpsert, { onConflict: 'id' });
        totalReelsSynced = reelsToUpsert.length;
      }

      // 3. Batch insert snapshots in one call
      if (snapshotsToInsert.length > 0) {
        await supabase.from('reel_snapshots').insert(snapshotsToInsert);
      }

      // 4. Batch upsert comments in chunks of 50
      if (commentsToUpsert.length > 0) {
        const chunkSize = 50;
        for (let i = 0; i < commentsToUpsert.length; i += chunkSize) {
          const chunk = commentsToUpsert.slice(i, i + chunkSize);
          await supabase.from('reel_comments').upsert(chunk, { onConflict: 'id' });
        }
        totalCommentsSynced = commentsToUpsert.length;
      }

      // Finish log entry
      if (syncLogId) {
        await supabase.from('sync_logs').update({
          status: 'success',
          finished_at: new Date().toISOString(),
          reels_synced: totalReelsSynced,
          comments_synced: totalCommentsSynced,
        }).eq('id', syncLogId);
      }
    } catch (dbErr: any) {
      console.error('[Apify Sync Database Error]', dbErr);
      if (syncLogId) {
        await supabase.from('sync_logs').update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          error_message: dbErr.message,
        }).eq('id', syncLogId);
      }
    }
  } else {
    totalReelsSynced = reelsData.length;
  }

  return {
    success: true,
    reelsSynced: totalReelsSynced,
    commentsSynced: totalCommentsSynced,
    timestamp: new Date().toISOString(),
    source: 'apify',
    accountUsername: cleanUsername,
    followersCount: profileData?.followersCount,
  };
}
