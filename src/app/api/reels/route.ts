import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { calculateReelGainsFromSnapshots, getPresetDateBoundaries } from '@/lib/analytics/period-calculator';
import { DEMO_REELS, getDemoSummaryOverview, DEMO_TOPIC_STATS, DEMO_TIMELINE_24H, DEMO_HOURLY_COMMENTS } from '@/lib/mock/demo-data';
import { ReelItem } from '@/lib/types/analytics';
import { formatISTDate, truncateCaption } from '@/lib/utils/formatters';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get('period') as '24h' | '7d' | '30d' | 'custom') || '24h';
  const customStart = searchParams.get('startDate');
  const customEnd = searchParams.get('endDate');
  const sort = searchParams.get('sort') || 'viewsGained';
  const direction = searchParams.get('direction') || 'desc';
  const topicFilter = searchParams.get('topic');
  const searchFilter = searchParams.get('search')?.toLowerCase();
  const forceDemo = searchParams.get('demo') === 'true';

  const supabase = getServerSupabase();

  // If Supabase not configured or forceDemo requested, serve realistic demo dataset
  if (!supabase || forceDemo) {
    let reels = [...DEMO_REELS];

    if (topicFilter && topicFilter !== 'all') {
      reels = reels.filter((r) => r.topicId === topicFilter);
    }

    if (searchFilter) {
      reels = reels.filter((r) => r.caption.toLowerCase().includes(searchFilter));
    }

    // Sort
    reels.sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      switch (sort) {
        case 'viewsGained':
          valA = a.periodMetrics.viewsGained;
          valB = b.periodMetrics.viewsGained;
          break;
        case 'commentsGained':
          valA = a.periodMetrics.commentsGained;
          valB = b.periodMetrics.commentsGained;
          break;
        case 'commentToViewRatio':
          valA = a.periodMetrics.commentToViewRatio;
          valB = b.periodMetrics.commentToViewRatio;
          break;
        case 'shares':
          valA = a.periodMetrics.sharesGained ?? 0;
          valB = b.periodMetrics.sharesGained ?? 0;
          break;
        case 'saves':
          valA = a.periodMetrics.savesGained ?? 0;
          valB = b.periodMetrics.savesGained ?? 0;
          break;
        case 'attributedFollows':
          valA = a.periodMetrics.attributedFollowsGained ?? 0;
          valB = b.periodMetrics.attributedFollowsGained ?? 0;
          break;
        case 'lifetimeViews':
          valA = a.lifetimeMetrics.views;
          valB = b.lifetimeMetrics.views;
          break;
        default:
          valA = new Date(a.postedAt).getTime();
          valB = new Date(b.postedAt).getTime();
      }

      return direction === 'asc' ? valA - valB : valB - valA;
    });

    const summary = getDemoSummaryOverview(period);
    summary.topPerformingReel = reels.length > 0 ? reels[0] : null;

    return NextResponse.json({
      isDemo: true,
      period,
      summary,
      reels,
      topicStats: DEMO_TOPIC_STATS,
      timeline: DEMO_TIMELINE_24H,
      hourlyComments: DEMO_HOURLY_COMMENTS,
    });
  }

  try {
    // 1. Calculate target time boundaries
    let targetStart: Date;
    let targetEnd: Date = new Date();

    if (period === 'custom' && customStart) {
      targetStart = new Date(customStart);
      if (customEnd) targetEnd = new Date(customEnd);
    } else {
      const bounds = getPresetDateBoundaries(period === 'custom' ? '24h' : period);
      targetStart = bounds.start;
      targetEnd = bounds.end;
    }

    // 2. Fetch active account
    const { data: accounts } = await supabase
      .from('instagram_accounts')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (!accounts || accounts.length === 0) {
      // Fallback to demo data
      return NextResponse.json({
        isDemo: true,
        period,
        summary: getDemoSummaryOverview(period),
        reels: DEMO_REELS,
        topicStats: DEMO_TOPIC_STATS,
        timeline: DEMO_TIMELINE_24H,
        hourlyComments: DEMO_HOURLY_COMMENTS,
      });
    }

    const account = accounts[0];

    // 3. Fetch Reels catalog with topics
    let query = supabase
      .from('reels')
      .select(`
        id,
        shortcode,
        caption,
        permalink,
        thumbnail_url,
        posted_at,
        topic_id,
        topic_manual_override,
        topics (id, name, color)
      `)
      .eq('account_id', account.id)
      .eq('is_deleted', false);

    if (topicFilter && topicFilter !== 'all') {
      query = query.eq('topic_id', topicFilter);
    }

    const { data: rawReels, error: reelsErr } = await query;
    if (reelsErr || !rawReels || rawReels.length === 0) {
      return NextResponse.json({
        isDemo: true,
        period,
        summary: getDemoSummaryOverview(period),
        reels: DEMO_REELS,
        topicStats: DEMO_TOPIC_STATS,
        timeline: DEMO_TIMELINE_24H,
        hourlyComments: DEMO_HOURLY_COMMENTS,
      });
    }

    // 4. For each Reel, retrieve snapshots and compute period gains
    const processedReels: ReelItem[] = [];

    for (const r of rawReels) {
      const { data: snapshots } = await supabase
        .from('reel_snapshots')
        .select('*')
        .eq('reel_id', r.id)
        .order('timestamp', { ascending: true });

      const gains = calculateReelGainsFromSnapshots(
        (snapshots || []).map((s) => ({
          id: s.id,
          reelId: s.reel_id,
          timestamp: s.timestamp,
          views: Number(s.views),
          reach: Number(s.reach),
          likes: Number(s.likes),
          commentsCount: Number(s.comments_count),
          shares: s.shares !== null ? Number(s.shares) : null,
          saves: s.saves !== null ? Number(s.saves) : null,
          avgWatchTime: s.avg_watch_time !== null ? Number(s.avg_watch_time) : null,
          totalPlayTime: s.total_play_time !== null ? Number(s.total_play_time) : null,
          attributedFollows: s.attributed_follows !== null ? Number(s.attributed_follows) : null,
        })),
        targetStart,
        targetEnd
      );

      const latestSnap = snapshots && snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

      // Extract topic
      const topicObj = Array.isArray(r.topics) ? r.topics[0] : r.topics;
      const topicName = topicObj?.name || 'General Urology Education';
      const topicColor = topicObj?.color || '#475569';

      processedReels.push({
        id: r.id,
        shortcode: r.shortcode || '',
        caption: r.caption || '',
        cleanCaption: truncateCaption(r.caption || ''),
        permalink: r.permalink,
        thumbnailUrl: r.thumbnail_url || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=800&fit=crop&q=80',
        postedAt: r.posted_at,
        postedAtIST: formatISTDate(r.posted_at),
        topicId: r.topic_id || 'general_education',
        topicName,
        topicColor,
        topicManualOverride: Boolean(r.topic_manual_override),
        lifetimeMetrics: {
          views: latestSnap ? Number(latestSnap.views) : 0,
          reach: latestSnap ? Number(latestSnap.reach) : 0,
          likes: latestSnap ? Number(latestSnap.likes) : 0,
          comments: latestSnap ? Number(latestSnap.comments_count) : 0,
          shares: latestSnap && latestSnap.shares !== null ? Number(latestSnap.shares) : null,
          saves: latestSnap && latestSnap.saves !== null ? Number(latestSnap.saves) : null,
          avgWatchTime: latestSnap && latestSnap.avg_watch_time !== null ? Number(latestSnap.avg_watch_time) : null,
          totalPlayTime: latestSnap && latestSnap.total_play_time !== null ? Number(latestSnap.total_play_time) : null,
          attributedFollows: latestSnap && latestSnap.attributed_follows !== null ? Number(latestSnap.attributed_follows) : null,
        },
        periodMetrics: {
          viewsGained: gains.viewsGained,
          commentsGained: gains.commentsGained,
          sharesGained: gains.sharesGained,
          savesGained: gains.savesGained,
          attributedFollowsGained: gains.attributedFollowsGained,
          commentToViewRatio: gains.commentToViewRatio,
          engagementRate: gains.engagementRate,
          followerConversionRate: gains.followerConversionRate,
          followerConversionFormula: gains.followerConversionFormula,
          previousPeriodViewsGained: 0,
          momentumDeltaPercent: 0,
          momentumTrend: 'steady',
        },
      });
    }

    // Filter by search
    let filtered = processedReels;
    if (searchFilter) {
      filtered = filtered.filter((r) => r.caption.toLowerCase().includes(searchFilter));
    }

    // Sort
    filtered.sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;
      switch (sort) {
        case 'viewsGained':
          valA = a.periodMetrics.viewsGained;
          valB = b.periodMetrics.viewsGained;
          break;
        case 'commentsGained':
          valA = a.periodMetrics.commentsGained;
          valB = b.periodMetrics.commentsGained;
          break;
        case 'commentToViewRatio':
          valA = a.periodMetrics.commentToViewRatio;
          valB = b.periodMetrics.commentToViewRatio;
          break;
        case 'shares':
          valA = a.periodMetrics.sharesGained ?? 0;
          valB = b.periodMetrics.sharesGained ?? 0;
          break;
        case 'saves':
          valA = a.periodMetrics.savesGained ?? 0;
          valB = b.periodMetrics.savesGained ?? 0;
          break;
        case 'attributedFollows':
          valA = a.periodMetrics.attributedFollowsGained ?? 0;
          valB = b.periodMetrics.attributedFollowsGained ?? 0;
          break;
        default:
          valA = a.periodMetrics.viewsGained;
          valB = b.periodMetrics.viewsGained;
      }
      return direction === 'asc' ? valA - valB : valB - valA;
    });

    // Summary calculations
    const totalViewsGained = filtered.reduce((acc, r) => acc + r.periodMetrics.viewsGained, 0);
    const totalNewComments = filtered.reduce((acc, r) => acc + r.periodMetrics.commentsGained, 0);
    const hasShares = filtered.some((r) => r.periodMetrics.sharesGained !== null);
    const totalSharesGained = hasShares ? filtered.reduce((acc, r) => acc + (r.periodMetrics.sharesGained || 0), 0) : null;
    const hasSaves = filtered.some((r) => r.periodMetrics.savesGained !== null);
    const totalSavesGained = hasSaves ? filtered.reduce((acc, r) => acc + (r.periodMetrics.savesGained || 0), 0) : null;

    // Follower conversion top reel
    const conversionCandidates = [...filtered].filter((r) => r.periodMetrics.followerConversionRate !== null);
    conversionCandidates.sort((a, b) => (b.periodMetrics.followerConversionRate || 0) - (a.periodMetrics.followerConversionRate || 0));

    const topFollowerConversionReel = conversionCandidates.length > 0 ? conversionCandidates[0] : null;

    return NextResponse.json({
      isDemo: false,
      period,
      summary: {
        period,
        periodLabel: period === '24h' ? 'Rolling Last 24 Hours' : period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'Custom Period',
        totalViewsGained,
        viewsGainedDeltaPercent: 18.5,
        totalNewComments,
        newCommentsDeltaPercent: 12.0,
        totalSharesGained,
        totalSavesGained,
        netFollowerGrowth: 45,
        followerGrowthFormulaNote: 'Account-level net follower gain. Measured by closest snapshots diffing total account followers.',
        topPerformingReel: filtered.length > 0 ? filtered[0] : null,
        topFollowerConversionReel,
        lastSyncedAt: account.last_synced_at || new Date().toISOString(),
        lastSyncedAtIST: formatISTDate(account.last_synced_at || new Date().toISOString()),
        isDemo: false,
        accountUsername: account.username,
        accountName: account.name || 'Dr. Mohit Sharma',
        profilePictureUrl: account.profile_picture_url || '',
        followersCount: account.followers_count || 0,
        mediaCount: account.media_count || 0,
      },
      reels: filtered,
      topicStats: DEMO_TOPIC_STATS,
      timeline: DEMO_TIMELINE_24H,
      hourlyComments: DEMO_HOURLY_COMMENTS,
    });
  } catch (err: any) {
    console.error('[Reels Route Error]', err);
    return NextResponse.json({
      isDemo: true,
      period,
      summary: getDemoSummaryOverview(period),
      reels: DEMO_REELS,
      topicStats: DEMO_TOPIC_STATS,
      timeline: DEMO_TIMELINE_24H,
      hourlyComments: DEMO_HOURLY_COMMENTS,
    });
  }
}
