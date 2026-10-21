// Official Apify Instagram Scraper Client
import { ApifyClient } from 'apify-client';
import { ApifyInstagramItem, ApifyUserProfile } from './types';

export class ApifyInstagramClient {
  private client: ApifyClient;
  private token: string;

  constructor(token?: string) {
    this.token = token || process.env.APIFY_API_TOKEN || process.env.APIFY_TOKEN || '';
    if (!this.token) {
      console.warn('[Apify Client Warning] No APIFY_API_TOKEN configured.');
    }
    this.client = new ApifyClient({ token: this.token });
  }

  public isConfigured(): boolean {
    return Boolean(this.token && this.token.length > 5);
  }

  /**
   * Scrape Instagram posts & Reels for a given account
   * Default target: dr.mohit_urowala
   */
  public async scrapeReels(
    username = 'dr.mohit_urowala',
    limit = 50
  ): Promise<{ profile: ApifyUserProfile | null; reels: ApifyInstagramItem[] }> {
    if (!this.isConfigured()) {
      throw new Error('APIFY_API_TOKEN is missing. Please provide your Apify API Token in Settings or environment variables.');
    }

    const cleanUsername = username.replace(/^@/, '').trim();
    console.log(`[Apify Scraper] Launching Instagram Scraper for @${cleanUsername} (Limit: ${limit})...`);

    try {
      // Run the official apify/instagram-scraper actor
      // It supports fetching posts/reels with comments, view counts, and engagement
      const run = await this.client.actor('apify/instagram-scraper').call({
        directUrls: [`https://www.instagram.com/${cleanUsername}`],
        resultsType: 'reels',
        resultsLimit: limit || 100,
      });

      console.log(`[Apify Scraper] Actor run completed (Run ID: ${run.id}). Fetching dataset items...`);

      const dataset = await this.client.dataset(run.defaultDatasetId).listItems();
      const items = (dataset.items as unknown) as ApifyInstagramItem[];

      let profile: ApifyUserProfile | null = null;
      const reels: ApifyInstagramItem[] = [];

      items.forEach((item) => {
        // Extract profile information if embedded in post or parent
        if (!profile && item.ownerUsername) {
          profile = {
            id: item.ownerId || `user_${item.ownerUsername}`,
            username: item.ownerUsername,
            fullName: item.ownerFullName,
            followersCount: 0,
            followsCount: 0,
            postsCount: 0,
          };
        }

        // Filter Reels and Video items
        const isReel =
          item.type === 'Video' ||
          Boolean(item.videoViewCount || item.videoPlayCount) ||
          item.url?.includes('/reel/');

        if (isReel) {
          reels.push(item);
        }
      });

      console.log(`[Apify Scraper] Successfully extracted ${reels.length} Reels for @${cleanUsername}.`);
      return { profile, reels };
    } catch (err: any) {
      console.error('[Apify Scraper Error]', err);
      throw new Error(`Apify Instagram Scraper failed: ${err.message || 'Unknown error'}`);
    }
  }

  /**
   * Scrape user profile details (followers count, bio, profile image)
   */
  public async scrapeProfile(username = 'dr.mohit_urowala'): Promise<ApifyUserProfile | null> {
    if (!this.isConfigured()) {
      throw new Error('APIFY_API_TOKEN is missing.');
    }

    const cleanUsername = username.replace(/^@/, '').trim();

    try {
      const run = await this.client.actor('apify/instagram-profile-scraper').call({
        usernames: [cleanUsername],
      });

      const dataset = await this.client.dataset(run.defaultDatasetId).listItems();
      const items = dataset.items as any[];

      if (items.length > 0) {
        const item = items[0];
        return {
          id: item.id || `user_${cleanUsername}`,
          username: cleanUsername,
          fullName: item.fullName || item.name,
          biography: item.biography || item.bio,
          profilePicUrl: item.profilePicUrl || item.profilePicUrlHD,
          profilePicUrlHD: item.profilePicUrlHD,
          followersCount: item.followersCount || item.edge_followed_by?.count || 0,
          followsCount: item.followsCount || item.edge_follow?.count || 0,
          postsCount: item.postsCount || item.edge_owner_to_timeline_media?.count || 0,
          isVerified: item.isVerified || false,
        };
      }
      return null;
    } catch (err: any) {
      console.warn(`[Apify Profile Scraper Fallback] Could not fetch separate profile: ${err.message}`);
      return null;
    }
  }
}
