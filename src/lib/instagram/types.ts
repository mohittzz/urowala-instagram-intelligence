// Meta Instagram Graph API types

export interface InstagramOAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  apiVersion: string;
}

export interface InstagramTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface InstagramBusinessAccount {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
}

export interface InstagramMediaItem {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_product_type?: 'REELS' | 'FEED' | 'STORY' | 'AD';
  permalink: string;
  thumbnail_url?: string;
  media_url?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  shortcode?: string;
}

export interface InstagramInsightMetric {
  name: string;
  period: string;
  values: Array<{ value: number }>;
  title?: string;
  description?: string;
}

export interface InstagramInsightsResponse {
  data: InstagramInsightMetric[];
}

export interface InstagramCommentItem {
  id: string;
  text: string;
  timestamp: string;
  username?: string;
  like_count?: number;
}

export interface InstagramCommentsResponse {
  data: InstagramCommentItem[];
  paging?: {
    cursors?: {
      after?: string;
      before?: string;
    };
    next?: string;
  };
}
