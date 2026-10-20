import { NextRequest, NextResponse } from 'next/server';
import { executeInstagramSync } from '@/lib/instagram/sync-engine';
import { executeApifySync } from '@/lib/apify/sync-engine';

export async function GET(request: NextRequest) {
  // Verify Vercel Cron Secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 });
  }

  console.log('[Vercel Cron] Starting scheduled hourly Instagram Reel metrics snapshot collection...');

  // If Apify is configured, use Apify for robust continuous ingestion
  if (process.env.APIFY_API_TOKEN) {
    console.log('[Vercel Cron] Running scheduled collection via Apify...');
    const apifyResult = await executeApifySync('dr.mohit_urowala', 'cron');
    return NextResponse.json(apifyResult);
  }

  // Fallback to Meta API
  console.log('[Vercel Cron] Running scheduled collection via Meta Graph API...');
  const result = await executeInstagramSync('cron');
  return NextResponse.json(result);
}
