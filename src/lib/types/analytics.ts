// TypeScript definitions for UROWALA Instagram Reel Intelligence

export type DateRangePreset = '24h' | '7d' | '30d' | 'custom';

export interface ReelMetrics {
  views: number; // Cumulative plays
  reach: number;
  likes: number;
  comments: number;
  shares: number | null;
  saves: number | null;
  avgWatchTime: number | null; // in seconds
  totalPlayTime: number | null; // in seconds
  attributedFollows: number | null; // null if not available via API
}

export interface ReelPeriodMetrics {
  viewsGained: number;
  commentsGained: number;
  sharesGained: number | null;
  savesGained: number | null;
  attributedFollowsGained: number | null;
  commentToViewRatio: number; // percentage (e.g. 0.45%)
  engagementRate: number; // percentage
  followerConversionRate: number | null; // percentage e.g. 1.2%
  followerConversionFormula: string;
  previousPeriodViewsGained: number;
  momentumDeltaPercent: number; // percentage change vs previous period
  momentumTrend: 'surging' | 'steady' | 'cooling';
}

export interface ReelItem {
  id: string;
  shortcode: string;
  caption: string;
  cleanCaption: string;
  permalink: string;
  thumbnailUrl: string;
  postedAt: string; // ISO string
  postedAtIST: string;
  topicId: string;
  topicName: string;
  topicColor: string;
  topicManualOverride: boolean;
  lifetimeMetrics: ReelMetrics;
  periodMetrics: ReelPeriodMetrics;
}

export interface SummaryOverview {
  period: DateRangePreset;
  periodLabel: string;
  totalViewsGained: number;
  viewsGainedDeltaPercent: number;
  totalNewComments: number;
  newCommentsDeltaPercent: number;
  totalInteractions?: number;
  totalSharesGained: number | null;
  totalSavesGained: number | null;
  netFollowerGrowth: number; // Account-level net growth
  followerGrowthFormulaNote: string;
  topPerformingReel: ReelItem | null;
  topFollowerConversionReel: ReelItem | null;
  lastSyncedAt: string;
  lastSyncedAtIST: string;
  isDemo: boolean;
  accountUsername: string;
  accountName: string;
  profilePictureUrl: string;
  followersCount: number;
  mediaCount: number;
}

export interface CommentInsightItem {
  id: string;
  reelId: string;
  reelCaption: string;
  reelPermalink: string;
  text: string;
  commenterUsername: string;
  postedAt: string;
  postedAtIST: string;
  likeCount: number;
  isQuestion: boolean;
  topicId: string;
  topicName: string;
}

export interface ContentIdeaItem {
  id: string;
  topicId: string;
  topicName: string;
  questionTheme: string;
  sampleQuestions: string[];
  frequencyCount: number;
  suggestedHook: string;
  clinicalAngle: string;
  urgency: 'High' | 'Medium' | 'Normal';
}

export interface TopicPerformanceItem {
  id: string;
  name: string;
  color: string;
  reelCount: number;
  totalViews: number;
  viewsGained: number;
  commentsGained: number;
  shares: number | null;
  saves: number | null;
  attributedFollows: number | null;
  avgEngagementRate: number;
  avgCommentToViewRatio: number;
}

export interface HistoricalTimelinePoint {
  timestamp: string;
  displayTime: string;
  viewsGained: number;
  newComments: number;
  shares: number;
  saves: number;
}

export interface HourlyCommentPoint {
  hour: string; // e.g., "10:00 AM"
  commentsCount: number;
  questionCount: number;
}

export type ActivePlatform = 'instagram' | 'facebook';

export interface FacebookPageItem {
  id: string;
  name: string;
  link: string;
  about: string;
  fanCount: number;
  followersCount: number;
  pictureUrl: string;
  coverUrl: string;
  lastSyncedAtIST: string;
}

export interface FacebookPostItem {
  id: string;
  message: string;
  permalinkUrl: string;
  createdTime: string;
  createdTimeIST: string;
  sharesCount: number;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  topicId: string;
  topicName: string;
  topicColor: string;
}

export interface FacebookPageSummary {
  period: DateRangePreset;
  periodLabel: string;
  followersCount: number;
  netFollowerGrowth: number;
  netFollowerGrowthDeltaPercent: number;
  totalViewsGained: number;
  viewsGainedDeltaPercent: number;
  totalInteractions: number;
  interactionsDeltaPercent: number;
  totalSharesGained: number;
  sharesDeltaPercent: number;
  lastSyncedAtIST: string;
  topPost: FacebookPostItem | null;
}

export interface CrossPlatformStats {
  instagramFollowers: number;
  facebookFollowers: number;
  totalCombinedFollowers: number;
  instagramSharePercent: number;
  facebookSharePercent: number;
  combinedViewsGained: number;
  combinedInteractions: number;
}
