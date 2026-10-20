// Period analytics calculator for snapshots comparison

export interface SnapshotRecord {
  id: number | string;
  reelId: string;
  timestamp: string; // ISO string
  views: number;
  reach: number;
  likes: number;
  commentsCount: number;
  shares: number | null;
  saves: number | null;
  avgWatchTime: number | null;
  totalPlayTime: number | null;
  attributedFollows: number | null;
}

export interface ComputedPeriodGain {
  viewsGained: number;
  commentsGained: number;
  sharesGained: number | null;
  savesGained: number | null;
  attributedFollowsGained: number | null;
  commentToViewRatio: number;
  engagementRate: number;
  followerConversionRate: number | null;
  followerConversionFormula: string;
  baselineTime: string | null;
  latestTime: string | null;
  dataQuality: 'full' | 'partial' | 'insufficient_snapshots';
}

/**
 * Given a chronological or reverse-chronological list of snapshots for a single reel,
 * find the latest snapshot and the snapshot closest to baseline (targetStartTime).
 * Handles missing metrics safely: returns null if the metric was never captured,
 * rather than assuming zero.
 */
export function calculateReelGainsFromSnapshots(
  snapshots: SnapshotRecord[],
  targetStartTime: Date,
  targetEndTime: Date = new Date()
): ComputedPeriodGain {
  if (!snapshots || snapshots.length === 0) {
    return {
      viewsGained: 0,
      commentsGained: 0,
      sharesGained: null,
      savesGained: null,
      attributedFollowsGained: null,
      commentToViewRatio: 0,
      engagementRate: 0,
      followerConversionRate: null,
      followerConversionFormula: 'Requires connected media-level follows metric & period reach',
      baselineTime: null,
      latestTime: null,
      dataQuality: 'insufficient_snapshots',
    };
  }

  // Sort chronological ascending
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Latest snapshot on or before targetEndTime
  const validForEnd = sorted.filter((s) => new Date(s.timestamp).getTime() <= targetEndTime.getTime());
  const latest = validForEnd.length > 0 ? validForEnd[validForEnd.length - 1] : sorted[sorted.length - 1];

  // Baseline snapshot closest to targetStartTime
  const baselineCandidates = sorted.filter((s) => new Date(s.timestamp).getTime() <= targetStartTime.getTime());
  let baseline: SnapshotRecord;

  if (baselineCandidates.length > 0) {
    // Pick the one closest to targetStartTime
    baseline = baselineCandidates[baselineCandidates.length - 1];
  } else {
    // If no snapshot exists before the start time, take the earliest snapshot available
    baseline = sorted[0];
  }

  // Handle potential cumulative counters reset or edge case where baseline > latest
  const viewsGained = Math.max(0, latest.views - baseline.views);
  const commentsGained = Math.max(0, latest.commentsCount - baseline.commentsCount);

  // Shares calculation: null-safe
  let sharesGained: number | null = null;
  if (latest.shares !== null && baseline.shares !== null) {
    sharesGained = Math.max(0, latest.shares - baseline.shares);
  } else if (latest.shares !== null) {
    sharesGained = latest.shares;
  }

  // Saves calculation: null-safe
  let savesGained: number | null = null;
  if (latest.saves !== null && baseline.saves !== null) {
    savesGained = Math.max(0, latest.saves - baseline.saves);
  } else if (latest.saves !== null) {
    savesGained = latest.saves;
  }

  // Attributed follows calculation: strictly per-media, never estimated from account growth
  let attributedFollowsGained: number | null = null;
  if (latest.attributedFollows !== null && baseline.attributedFollows !== null) {
    attributedFollowsGained = Math.max(0, latest.attributedFollows - baseline.attributedFollows);
  } else if (latest.attributedFollows !== null) {
    attributedFollowsGained = latest.attributedFollows;
  }

  // Comment-to-view ratio: (comments gained / views gained) * 100
  // If period views gained is 0, fallback to lifetime ratio
  let commentToViewRatio = 0;
  if (viewsGained > 0) {
    commentToViewRatio = Number(((commentsGained / viewsGained) * 100).toFixed(2));
  } else if (latest.views > 0) {
    commentToViewRatio = Number(((latest.commentsCount / latest.views) * 100).toFixed(2));
  }

  // Engagement rate: (likes + comments + shares + saves) / reach
  const interactions = (latest.likes || 0) + (latest.commentsCount || 0) + (latest.shares || 0) + (latest.saves || 0);
  const engagementRate = latest.reach > 0 ? Number(((interactions / latest.reach) * 100).toFixed(1)) : 0;

  // Follower conversion rate: (Attributed Follows / Period Reach or Lifetime Reach) * 100
  let followerConversionRate: number | null = null;
  let followerConversionFormula = 'Not available through connected API';

  if (attributedFollowsGained !== null && latest.reach > 0) {
    followerConversionRate = Number(((attributedFollowsGained / latest.reach) * 100).toFixed(2));
    followerConversionFormula = `(${attributedFollowsGained} Attributed Follows / ${latest.reach.toLocaleString('en-IN')} Reach) × 100%`;
  }

  return {
    viewsGained,
    commentsGained,
    sharesGained,
    savesGained,
    attributedFollowsGained,
    commentToViewRatio,
    engagementRate,
    followerConversionRate,
    followerConversionFormula,
    baselineTime: baseline.timestamp,
    latestTime: latest.timestamp,
    dataQuality: sorted.length >= 2 ? 'full' : 'partial',
  };
}

/**
 * Calculates start and end timestamps for standard presets in Asia/Kolkata context
 */
export function getPresetDateBoundaries(preset: '24h' | '7d' | '30d'): { start: Date; end: Date; previousStart: Date; previousEnd: Date } {
  const now = new Date();
  const end = new Date(now);

  let durationMs = 24 * 3600 * 1000;
  if (preset === '7d') durationMs = 7 * 24 * 3600 * 1000;
  if (preset === '30d') durationMs = 30 * 24 * 3600 * 1000;

  const start = new Date(end.getTime() - durationMs);
  const previousEnd = new Date(start);
  const previousStart = new Date(previousEnd.getTime() - durationMs);

  return { start, end, previousStart, previousEnd };
}
