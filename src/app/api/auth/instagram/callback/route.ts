import { NextRequest, NextResponse } from 'next/server';
import { InstagramApiClient } from '@/lib/instagram/client';
import { getServerSupabase } from '@/lib/supabase/server';
import { executeInstagramSync } from '@/lib/instagram/sync-engine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorReason = searchParams.get('error_reason');
  const errorDescription = searchParams.get('error_description');

  if (error || !code) {
    console.error('[OAuth Callback Error]', { error, errorReason, errorDescription });
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(errorDescription || 'Authentication cancelled')}`, request.url)
    );
  }

  const appId = process.env.INSTAGRAM_APP_ID || '';
  const appSecret = process.env.INSTAGRAM_APP_SECRET || '';
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/instagram/callback`;

  try {
    // 1. Exchange code for short-lived token
    const shortTokenRes = await InstagramApiClient.exchangeCodeForToken(code, appId, appSecret, redirectUri);

    // 2. Exchange for 60-day long-lived token
    const longTokenRes = await InstagramApiClient.getLongLivedToken(shortTokenRes.accessToken, appId, appSecret);

    // 3. Find connected Instagram Business account
    const igClient = new InstagramApiClient(longTokenRes.accessToken);
    const businessAccounts = await igClient.getConnectedBusinessAccounts();

    if (businessAccounts.length === 0) {
      return NextResponse.redirect(
        new URL('/settings?error=No+connected+Instagram+Business+or+Creator+account+found.+Please+ensure+your+Instagram+is+linked+to+your+Facebook+Page.', request.url)
      );
    }

    // Select @dr.mohit_urowala or the first business account
    const targetAccount = businessAccounts.find((a) => a.username.toLowerCase().includes('urowala') || a.username.toLowerCase().includes('mohit')) || businessAccounts[0];

    const supabase = getServerSupabase();
    if (supabase) {
      const expiresAt = new Date(Date.now() + (longTokenRes.expiresIn || 5184000) * 1000).toISOString();

      await supabase.from('instagram_accounts').upsert({
        id: targetAccount.id,
        username: targetAccount.username,
        name: targetAccount.name || 'Dr. Mohit Sharma',
        profile_picture_url: targetAccount.profile_picture_url || null,
        followers_count: targetAccount.followers_count || 0,
        follows_count: targetAccount.follows_count || 0,
        media_count: targetAccount.media_count || 0,
        access_token: longTokenRes.accessToken,
        token_expires_at: expiresAt,
        sync_status: 'idle',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      // Trigger initial collection in background
      executeInstagramSync('manual').catch((err) => console.error('Initial background sync error:', err));
    }

    return NextResponse.redirect(
      new URL('/settings?connected=true&account=' + encodeURIComponent(targetAccount.username), request.url)
    );
  } catch (err: any) {
    console.error('[OAuth Exception]', err);
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(err.message || 'OAuth token exchange failed')}`, request.url)
    );
  }
}
