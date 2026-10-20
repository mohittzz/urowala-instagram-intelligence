// Official Meta Instagram Graph API Client
import {
  InstagramBusinessAccount,
  InstagramMediaItem,
  InstagramInsightMetric,
  InstagramCommentItem,
} from './types';

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';

export class InstagramApiClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Helper to execute GET requests to Graph API with error handling
   */
  private async get<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${GRAPH_API_BASE}${endpoint}`);
    url.searchParams.set('access_token', this.accessToken);

    Object.entries(params).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 0 }, // always fresh in server routes
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      const errorMsg = data.error?.message || `HTTP ${res.status} from Instagram Graph API`;
      const code = data.error?.code || res.status;
      console.error(`[InstagramApiClient Error] Code ${code}: ${errorMsg}`, data.error);
      throw new Error(`Meta API [${code}]: ${errorMsg}`);
    }

    return data as T;
  }

  /**
   * Exchange an authorization code for a short-lived token
   */
  public static async exchangeCodeForToken(
    code: string,
    appId: string,
    appSecret: string,
    redirectUri: string
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const url = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
    url.searchParams.set('client_id', appId);
    url.searchParams.set('client_secret', appSecret);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('code', code);

    const res = await fetch(url.toString(), { method: 'GET' });
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(`Token exchange failed: ${data.error?.message || res.statusText}`);
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 3600,
    };
  }

  /**
   * Exchange short-lived token for long-lived 60-day token
   */
  public static async getLongLivedToken(
    shortLivedToken: string,
    appId: string,
    appSecret: string
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const url = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
    url.searchParams.set('grant_type', 'fb_exchange_token');
    url.searchParams.set('client_id', appId);
    url.searchParams.set('client_secret', appSecret);
    url.searchParams.set('fb_exchange_token', shortLivedToken);

    const res = await fetch(url.toString(), { method: 'GET' });
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(`Long-lived token exchange failed: ${data.error?.message || res.statusText}`);
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 5184000, // ~60 days
    };
  }

  /**
   * Refresh a long-lived access token
   */
  public static async refreshLongLivedToken(
    existingToken: string,
    appId: string,
    appSecret: string
  ): Promise<{ accessToken: string; expiresIn: number }> {
    return this.getLongLivedToken(existingToken, appId, appSecret);
  }

  /**
   * Discover Connected Instagram Business/Creator Account
   */
  public async getConnectedBusinessAccounts(): Promise<InstagramBusinessAccount[]> {
    interface PageResponse {
      data: Array<{
        id: string;
        name: string;
        instagram_business_account?: InstagramBusinessAccount;
      }>;
    }

    const res = await this.get<PageResponse>('/me/accounts', {
      fields: 'id,name,instagram_business_account{id,username,name,profile_picture_url,followers_count,follows_count,media_count}',
    });

    const accounts: InstagramBusinessAccount[] = [];
    res.data.forEach((page) => {
      if (page.instagram_business_account) {
        accounts.push(page.instagram_business_account);
      }
    });

    return accounts;
  }

  /**
   * Fetch Account Details
   */
  public async getAccountDetails(igAccountId: string): Promise<InstagramBusinessAccount> {
    return this.get<InstagramBusinessAccount>(`/${igAccountId}`, {
      fields: 'id,username,name,profile_picture_url,followers_count,follows_count,media_count',
    });
  }

  /**
   * Fetch recent media and Reels
   */
  public async getRecentMedia(igAccountId: string, limit = 50): Promise<InstagramMediaItem[]> {
    interface MediaResponse {
      data: InstagramMediaItem[];
      paging?: { next?: string };
    }

    const res = await this.get<MediaResponse>(`/${igAccountId}/media`, {
      fields: 'id,caption,media_type,media_product_type,permalink,thumbnail_url,media_url,timestamp,like_count,comments_count,shortcode',
      limit: limit.toString(),
    });

    // Filter to Reels and video items
    return res.data.filter(
      (item) => item.media_product_type === 'REELS' || item.media_type === 'VIDEO'
    );
  }

  /**
   * Fetch insights for a specific Reel media
   * Safe execution: Tries standard metrics first, then attempts advanced metrics
   */
  public async getReelInsights(mediaId: string): Promise<{
    views: number;
    reach: number;
    likes: number;
    commentsCount: number;
    shares: number | null;
    saves: number | null;
    avgWatchTime: number | null;
    totalPlayTime: number | null;
    attributedFollows: number | null;
  }> {
    let plays = 0;
    let reach = 0;
    let shares: number | null = null;
    let saves: number | null = null;
    let avgWatchTime: number | null = null;
    let totalPlayTime: number | null = null;
    let attributedFollows: number | null = null;

    try {
      // Primary Reel metrics supported across Instagram API versions
      const metricsList = 'plays,reach,saved,shares,total_interactions,ig_reels_avg_watch_time,ig_reels_video_view_total_time,follows';
      
      const res = await this.get<{ data: InstagramInsightMetric[] }>(`/${mediaId}/insights`, {
        metric: metricsList,
      });

      res.data.forEach((metric) => {
        const val = metric.values?.[0]?.value ?? 0;
        switch (metric.name) {
          case 'plays':
            plays = val;
            break;
          case 'reach':
            reach = val;
            break;
          case 'shares':
            shares = val;
            break;
          case 'saved':
            saves = val;
            break;
          case 'ig_reels_avg_watch_time':
            // Provided in milliseconds by Graph API; convert to seconds
            avgWatchTime = val > 0 ? Number((val / 1000).toFixed(1)) : val;
            break;
          case 'ig_reels_video_view_total_time':
            totalPlayTime = val > 0 ? Number((val / 1000).toFixed(1)) : val;
            break;
          case 'follows':
            attributedFollows = val;
            break;
        }
      });
    } catch (err: any) {
      console.warn(`[Reel Insights Warning] Media ${mediaId} fallback to core metrics: ${err.message}`);
      
      // Fallback: Try basic plays and reach if extended metrics throw permissions error
      try {
        const fallbackRes = await this.get<{ data: InstagramInsightMetric[] }>(`/${mediaId}/insights`, {
          metric: 'plays,reach,saved',
        });
        fallbackRes.data.forEach((m) => {
          const val = m.values?.[0]?.value ?? 0;
          if (m.name === 'plays') plays = val;
          if (m.name === 'reach') reach = val;
          if (m.name === 'saved') saves = val;
        });
      } catch (fallbackErr) {
        console.error(`[Reel Insights Fail] Media ${mediaId} insights unavailable`, fallbackErr);
      }
    }

    return {
      views: plays,
      reach,
      likes: 0,
      commentsCount: 0,
      shares,
      saves,
      avgWatchTime,
      totalPlayTime,
      attributedFollows,
    };
  }

  /**
   * Fetch recent comments for a Reel
   */
  public async getReelComments(mediaId: string, limit = 50): Promise<InstagramCommentItem[]> {
    try {
      const res = await this.get<{ data: InstagramCommentItem[] }>(`/${mediaId}/comments`, {
        fields: 'id,text,timestamp,username,like_count',
        limit: limit.toString(),
      });
      return res.data || [];
    } catch (err) {
      console.warn(`[Comments Warning] Could not fetch comments for ${mediaId}`, err);
      return [];
    }
  }
}
