import { NextRequest, NextResponse } from 'next/server';
import { executeInstagramSync } from '@/lib/instagram/sync-engine';

export async function POST(request: NextRequest) {
  try {
    const result = await executeInstagramSync('manual');
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
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
