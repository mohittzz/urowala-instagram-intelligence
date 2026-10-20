import { NextRequest, NextResponse } from 'next/server';
import { executeApifySync } from '@/lib/apify/sync-engine';

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // empty body is fine
    }

    const username = body.username || 'dr.mohit_urowala';
    const customToken = body.token || process.env.APIFY_API_TOKEN;

    const result = await executeApifySync(username, 'manual', customToken);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, source: 'apify' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      source: 'apify',
      accountUsername: result.accountUsername,
      reelsSynced: result.reelsSynced,
      commentsSynced: result.commentsSynced,
      followersCount: result.followersCount,
      timestamp: result.timestamp,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Apify sync failed unexpectedly' },
      { status: 500 }
    );
  }
}
