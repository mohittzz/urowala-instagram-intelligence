import { NextRequest, NextResponse } from 'next/server';
import { executeInstagramSync } from '@/lib/instagram/sync-engine';

export async function GET(request: NextRequest) {
  // Verify Vercel Cron Secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 });
  }

  console.log('[Vercel Cron] Starting scheduled hourly Instagram Reel metrics snapshot collection...');
  const result = await executeInstagramSync('cron');

  return NextResponse.json(result);
}
