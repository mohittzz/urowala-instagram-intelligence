// Server-side historical snapshot collection and sync engine
import { getServerSupabase } from '../supabase/server';
import { InstagramApiClient } from './client';
import { isCommentQuestion } from '../analytics/comment-analyzer';

export interface SyncResult {
  success: boolean;
  reelsSynced: number;
  commentsSynced: number;
  timestamp: string;
  error?: string;
}

export async function executeInstagramSync(triggerType: 'cron' | 'manual' | 'webhook' = 'manual'): Promise<SyncResult> {
  const supabase = getServerSupabase();
  const startTime = new Date().toISOString();

  if (!supabase) {
    return {
      success: false,
      reelsSynced: 0,
      commentsSynced: 0,
      timestamp: startTime,
      error: 'Supabase server client not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    };
  }

  // 1. Fetch connected account
  const { data: accounts, error: accountErr } = await supabase
    .from('instagram_accounts')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (accountErr || !accounts || accounts.length === 0) {
    return {
      success: false,
      reelsSynced: 0,
      commentsSynced: 0,
      timestamp: startTime,
      error: 'No connected Instagram account found. Connect via Meta OAuth first.',
    };
  }

  const account = accounts[0];
  if (!account.access_token) {
    return {
      success: false,
      reelsSynced: 0,
      commentsSynced: 0,
      timestamp: startTime,
      error: 'Instagram account missing access token.',
    };
  }

  // Create sync log entry
  const { data: logEntry } = await supabase
    .from('sync_logs')
    .insert({
      account_id: account.id,
      started_at: startTime,
      status: 'running',
      trigger_type: triggerType,
    })
    .select('id')
    .single();

  const syncLogId = logEntry?.id;

  try {
    const igClient = new InstagramApiClient(account.access_token);

    // 2. Fetch fresh account info & record account snapshot for follower growth
    const latestAccountInfo = await igClient.getAccountDetails(account.id);
    await supabase.from('instagram_accounts').update({
      followers_count: latestAccountInfo.followers_count,
      follows_count: latestAccountInfo.follows_count,
      media_count: latestAccountInfo.media_count,
      last_synced_at: new Date().toISOString(),
      sync_status: 'idle',
      sync_error: null,
    }).eq('id', account.id);

    await supabase.from('account_snapshots').insert({
      account_id: account.id,
      timestamp: new Date().toISOString(),
      followers_count: latestAccountInfo.followers_count,
      follows_count: latestAccountInfo.follows_count,
      media_count: latestAccountInfo.media_count,
    });

    // 3. Fetch recent media / Reels
    const mediaList = await igClient.getRecentMedia(account.id, 50);
    let totalReelsSynced = 0;
    let totalCommentsSynced = 0;

    // Fetch existing topics for auto-categorization
    const { data: topics } = await supabase.from('topics').select('id, name, keywords');

    for (const media of mediaList) {
      // Determine topic if not manually overridden
      let detectedTopicId = 'general_education';
      if (topics && media.caption) {
        const lowerCaption = media.caption.toLowerCase();
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

      // Upsert reel catalog record
      const { data: existingReel } = await supabase
        .from('reels')
        .select('topic_id, topic_manual_override')
        .eq('id', media.id)
        .single();

      const topicToSet = (existingReel && existingReel.topic_manual_override) 
        ? existingReel.topic_id 
        : detectedTopicId;

      await supabase.from('reels').upsert({
        id: media.id,
        account_id: account.id,
        shortcode: media.shortcode || null,
        caption: media.caption || null,
        media_type: media.media_type,
        media_product_type: media.media_product_type || 'REELS',
        permalink: media.permalink,
        thumbnail_url: media.thumbnail_url || media.media_url,
        posted_at: media.timestamp,
        topic_id: topicToSet,
        is_deleted: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      // 4. Fetch Insights for this Reel
      const insights = await igClient.getReelInsights(media.id);

      // Record timestamped snapshot
      await supabase.from('reel_snapshots').insert({
        reel_id: media.id,
        timestamp: new Date().toISOString(),
        views: insights.views,
        reach: insights.reach,
        likes: media.like_count || 0,
        comments_count: media.comments_count || 0,
        shares: insights.shares,
        saves: insights.saves,
        avg_watch_time: insights.avgWatchTime,
        total_play_time: insights.totalPlayTime,
        attributed_follows: insights.attributedFollows,
      });

      totalReelsSynced++;

      // 5. Fetch comments & categorize questions
      const comments = await igClient.getReelComments(media.id, 30);
      for (const comment of comments) {
        const isQuestion = isCommentQuestion(comment.text);
        await supabase.from('reel_comments').upsert({
          id: comment.id,
          reel_id: media.id,
          text: comment.text,
          commenter_username: comment.username || 'user',
          posted_at: comment.timestamp,
          like_count: comment.like_count || 0,
          is_question: isQuestion,
        }, { onConflict: 'id' });

        totalCommentsSynced++;
      }
    }

    // Update sync log
    if (syncLogId) {
      await supabase.from('sync_logs').update({
        status: 'success',
        finished_at: new Date().toISOString(),
        reels_synced: totalReelsSynced,
        comments_synced: totalCommentsSynced,
      }).eq('id', syncLogId);
    }

    return {
      success: true,
      reelsSynced: totalReelsSynced,
      commentsSynced: totalCommentsSynced,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('[Sync Engine Fatal Error]', err);

    if (syncLogId) {
      await supabase.from('sync_logs').update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        error_message: err.message || 'Unknown sync error',
      }).eq('id', syncLogId);
    }

    await supabase.from('instagram_accounts').update({
      sync_status: 'error',
      sync_error: err.message,
    }).eq('id', account.id);

    return {
      success: false,
      reelsSynced: 0,
      commentsSynced: 0,
      timestamp: startTime,
      error: err.message,
    };
  }
}
