import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || 'https://socialmedia.urowala.com/api/auth/instagram/callback';

  if (!appId) {
    return NextResponse.json(
      { error: 'Meta Instagram App ID is not configured in environment variables (INSTAGRAM_APP_ID).' },
      { status: 500 }
    );
  }

  // Permissions required for Professional Instagram account intelligence
  const scope = [
    'instagram_basic',
    'instagram_manage_insights',
    'instagram_manage_comments',
    'pages_show_list',
    'pages_read_engagement',
  ].join(',');

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scope}&response_type=code&state=urowala_security_state`;

  return NextResponse.redirect(authUrl);
}
