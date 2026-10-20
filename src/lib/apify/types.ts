// Apify Instagram Scraper types

export interface ApifyInstagramItem {
  id: string;
  type?: string; // 'Video' | 'Image' | 'Sidecar'
  shortCode?: string;
  caption?: string;
  hashtags?: string[];
  url?: string;
  commentsCount?: number;
  likesCount?: number;
  videoViewCount?: number;
  videoPlayCount?: number;
  videoDuration?: number;
  displayUrl?: string;
  images?: string[];
  timestamp?: string;
  ownerUsername?: string;
  ownerFullName?: string;
  ownerId?: string;
  latestComments?: Array<{
    id: string;
    text: string;
    ownerUsername?: string;
    timestamp?: string;
    likesCount?: number;
  }>;
}

export interface ApifyUserProfile {
  id: string;
  username: string;
  fullName?: string;
  biography?: string;
  profilePicUrl?: string;
  profilePicUrlHD?: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  isVerified?: boolean;
}

export interface ApifySyncOptions {
  username?: string;
  maxPosts?: number;
  token?: string;
}
