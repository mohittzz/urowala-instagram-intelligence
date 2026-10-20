import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { DEMO_ACCOUNT } from '@/lib/mock/demo-data';

export async function GET() {
  const hasApifyToken = Boolean(process.env.APIFY_API_TOKEN || process.env.APIFY_TOKEN);
  const hasMetaApp = Boolean(process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_APP_SECRET);
  const supabase = getServerSupabase();

  if (!supabase) {
    return NextResponse.json({
      connected: false,
      isDemo: true,
      provider: hasApifyToken ? 'apify_ready' : hasMetaApp ? 'meta_ready' : 'none',
      hasApifyToken,
      hasMetaApp,
      reason: 'Supabase credentials not configured in environment variables.',
      account: DEMO_ACCOUNT,
      lastSync: null,
    });
  }

  try {
    const { data: accounts, error } = await supabase
      .from('instagram_accounts')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error || !accounts || accounts.length === 0) {
      return NextResponse.json({
        connected: false,
        isDemo: true,
        provider: hasApifyToken ? 'apify_ready' : hasMetaApp ? 'meta_ready' : 'none',
        hasApifyToken,
        hasMetaApp,
        reason: 'No synced Instagram account found in database yet. Ready to ingest with Apify or Meta.',
        account: DEMO_ACCOUNT,
        lastSync: null,
      });
    }

    const acc = accounts[0];

    // Fetch latest sync log
    const { data: logs } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('account_id', acc.id)
      .order('started_at', { ascending: false })
      .limit(1);

    return NextResponse.json({
      connected: true,
      isDemo: false,
      provider: hasApifyToken ? 'apify' : 'meta',
      hasApifyToken,
      hasMetaApp,
      account: {
        id: acc.id,
        username: acc.username,
        name: acc.name,
        profilePictureUrl: acc.profile_picture_url,
        followersCount: acc.followers_count,
        followsCount: acc.follows_count,
        mediaCount: acc.media_count,
        tokenExpiresAt: acc.token_expires_at,
        lastSyncedAt: acc.last_synced_at,
        syncStatus: acc.sync_status,
      },
      lastSync: logs && logs.length > 0 ? logs[0] : null,
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      isDemo: true,
      provider: hasApifyToken ? 'apify_ready' : 'none',
      hasApifyToken,
      hasMetaApp,
      reason: err.message || 'Database error',
      account: DEMO_ACCOUNT,
      lastSync: null,
    });
  }
}
