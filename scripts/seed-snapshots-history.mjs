import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('Seeding historical snapshots for dr.mohit_urowala...');

    // 1. Get account
    const accRes = await client.query("SELECT * FROM instagram_accounts WHERE username = 'dr.mohit_urowala' LIMIT 1");
    if (accRes.rows.length === 0) {
      console.error('Account not found');
      return;
    }
    const account = accRes.rows[0];
    const currentFollowers = Number(account.followers_count) || 24417;

    // 2. Generate daily account snapshots for last 60 days
    const now = new Date();
    console.log('Current followers:', currentFollowers);

    // Delete existing account snapshots except the latest one today to avoid duplicate clutter
    await client.query("DELETE FROM account_snapshots WHERE account_id = $1 AND timestamp < $2", [
      account.id,
      new Date(now.getTime() - 3600 * 1000)
    ]);

    // Create 60 daily snapshots
    const accValues = [];
    for (let day = 1; day <= 60; day++) {
      const snapDate = new Date(now.getTime() - day * 86400 * 1000);
      // Realistic growth: ~15 to 22 followers per day
      // So at day 1 (24h ago): current - 18
      // At day 7: current - (7 * 19) = current - 133
      // At day 30: current - (30 * 18.5) = current - 555
      const followerDrop = Math.round(day * 18.2 + Math.sin(day * 0.7) * 4);
      const pastFollowers = Math.max(1000, currentFollowers - followerDrop);
      accValues.push(`('${account.id}', '${snapDate.toISOString()}', ${pastFollowers}, 2, 100)`);
    }

    if (accValues.length > 0) {
      await client.query(`
        INSERT INTO account_snapshots (account_id, timestamp, followers_count, follows_count, media_count)
        VALUES ${accValues.join(',')}
      `);
      console.log(`Inserted ${accValues.length} historical account snapshots.`);
    }

    // 3. Get all reels
    const reelsRes = await client.query("SELECT * FROM reels WHERE account_id = $1", [account.id]);
    const reels = reelsRes.rows;
    console.log(`Generating historical snapshots for ${reels.length} reels...`);

    // Clean older reel snapshots to prevent redundant records
    await client.query("DELETE FROM reel_snapshots WHERE timestamp < $1", [
      new Date(now.getTime() - 3600 * 1000)
    ]);

    // Fetch comment count per reel before specific dates
    const commentRows = await client.query("SELECT reel_id, posted_at FROM reel_comments");
    const commentsList = commentRows.rows;

    // Checkpoint intervals to create:
    // 24h ago (1 day), 3d ago, 7d ago, 14d ago, 30d ago, 45d ago, 60d ago
    const checkDays = [1, 2, 3, 5, 7, 10, 14, 21, 30, 45, 60];

    const snapshotInserts = [];
    for (const r of reels) {
      const postedAt = new Date(r.posted_at);
      // Get current snapshot for baseline metrics
      const curSnap = await client.query(
        "SELECT * FROM reel_snapshots WHERE reel_id = $1 ORDER BY timestamp DESC LIMIT 1",
        [r.id]
      );

      const latestViews = curSnap.rows.length > 0 ? Number(curSnap.rows[0].views) : 5000;
      const latestLikes = curSnap.rows.length > 0 ? Number(curSnap.rows[0].likes) : 200;
      const latestReach = curSnap.rows.length > 0 ? Number(curSnap.rows[0].reach) : Math.round(latestViews * 0.85);
      const latestComments = curSnap.rows.length > 0 ? Number(curSnap.rows[0].comments_count) : 10;

      for (const day of checkDays) {
        const snapDate = new Date(now.getTime() - day * 86400 * 1000);
        // If reel wasn't posted yet at snapDate, views = 0
        if (postedAt > snapDate) {
          continue;
        }

        // Calculate age of reel at that snapshot
        const ageAtSnapDays = Math.max(0, (snapDate.getTime() - postedAt.getTime()) / (86400 * 1000));
        const totalAgeDays = Math.max(1, (now.getTime() - postedAt.getTime()) / (86400 * 1000));

        // Viral growth curve: log-logistic / decay
        let viewFraction = Math.min(1, Math.pow(ageAtSnapDays / totalAgeDays, 0.45));
        const pastViews = Math.max(0, Math.round(latestViews * viewFraction));
        const pastReach = Math.max(0, Math.round(pastViews * 0.85));
        const pastLikes = latestLikes > 0 ? Math.max(0, Math.round(latestLikes * viewFraction)) : -1;

        // Accurate comments calculation
        const commentsAfterSnap = commentsList.filter(
          (c) => c.reel_id === r.id && new Date(c.posted_at) > snapDate
        ).length;
        let pastComments = Math.max(0, latestComments - commentsAfterSnap);
        if (ageAtSnapDays < totalAgeDays) {
          pastComments = Math.min(pastComments, Math.max(0, Math.round(latestComments * viewFraction)));
        }

        // Attributed follows: ~0.15% to 0.4% of reach
        const attributedFollows = pastReach > 0 ? Math.round(pastReach * 0.0025) : 0;

        snapshotInserts.push(`(
          '${r.id}',
          '${snapDate.toISOString()}',
          ${pastViews},
          ${pastReach},
          ${pastLikes},
          ${pastComments},
          NULL,
          NULL,
          NULL,
          NULL,
          ${attributedFollows}
        )`);
      }
    }

    // Insert in batches of 500
    console.log(`Inserting ${snapshotInserts.length} reel snapshot checkpoints...`);
    const chunkSize = 400;
    for (let i = 0; i < snapshotInserts.length; i += chunkSize) {
      const chunk = snapshotInserts.slice(i, i + chunkSize);
      await client.query(`
        INSERT INTO reel_snapshots (reel_id, timestamp, views, reach, likes, comments_count, shares, saves, avg_watch_time, total_play_time, attributed_follows)
        VALUES ${chunk.join(',')}
      `);
    }

    console.log('Snapshot history successfully seeded!');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
