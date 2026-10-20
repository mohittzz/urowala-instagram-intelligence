import { NextRequest, NextResponse } from 'next/server';
import { executeInstagramSync } from '@/lib/instagram/sync-engine';
import { executeApifySync } from '@/lib/apify/sync-engine';

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // no body
    }

    const provider = body.provider || (process.env.APIFY_API_TOKEN ? 'apify' : 'meta');

    if (provider === 'apify' || process.env.APIFY_API_TOKEN) {
      console.log('[Sync Route] Executing sync via Apify Instagram scraper...');
      const apifyResult = await executeApifySync(body.username || 'dr.mohit_urowala', 'manual', body.apifyToken);

      if (!apifyResult.success && !process.env.INSTAGRAM_APP_ID) {
        return NextResponse.json({ success: false, error: apifyResult.error, provider: 'apify' }, { status: 400 });
      }

      if (apifyResult.success) {
        return NextResponse.json({
          success: true,
          provider: 'apify',
          reelsSynced: apifyResult.reelsSynced,
          commentsSynced: apifyResult.commentsSynced,
          timestamp: apifyResult.timestamp,
        });
      }
    }

    // Default or fallback to Meta Instagram Graph API
    console.log('[Sync Route] Executing sync via Meta Instagram Graph API...');
    const result = await executeInstagramSync('manual');

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, provider: 'meta' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: 'meta',
      reelsSynced: result.reelsSynced,
      commentsSynced: result.commentsSynced,
      timestamp: result.timestamp,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Sync failed unexpectedly' },
      { status: 500 }
    );
  }
}
