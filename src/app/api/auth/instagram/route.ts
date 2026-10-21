import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const appId = process.env.INSTAGRAM_APP_ID;
  const url = new URL(request.url);
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || `${url.origin}/api/auth/instagram/callback`;

  if (!appId) {
    return NextResponse.redirect(new URL('/settings?meta_error=missing_app_id', url.origin));
  }

  // Permissions required for Professional Instagram account intelligence
  // Excluded deprecated pages_show_list which causes Meta OAuth rejection on non-verified apps
  const scope = [
    'instagram_basic',
    'instagram_manage_insights',
  ].join(',');

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scope}&response_type=code&state=urowala_security_state`;

  return NextResponse.redirect(authUrl);
}
