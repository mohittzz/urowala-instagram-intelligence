import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { appId, appSecret, accessToken } = await request.json();

    const envFilePath = path.join(process.cwd(), '.env.local');
    let envContent = fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath, 'utf8') : '';

    if (appId) {
      if (/INSTAGRAM_APP_ID=.*/.test(envContent)) {
        envContent = envContent.replace(/INSTAGRAM_APP_ID=.*/, `INSTAGRAM_APP_ID=${appId.trim()}`);
      } else {
        envContent += `\nINSTAGRAM_APP_ID=${appId.trim()}`;
      }
      process.env.INSTAGRAM_APP_ID = appId.trim();
    }

    if (appSecret) {
      if (/INSTAGRAM_APP_SECRET=.*/.test(envContent)) {
        envContent = envContent.replace(/INSTAGRAM_APP_SECRET=.*/, `INSTAGRAM_APP_SECRET=${appSecret.trim()}`);
      } else {
        envContent += `\nINSTAGRAM_APP_SECRET=${appSecret.trim()}`;
      }
      process.env.INSTAGRAM_APP_SECRET = appSecret.trim();
    }

    fs.writeFileSync(envFilePath, envContent, 'utf8');

    // If a direct Meta Access Token was provided, test and store in Supabase
    if (accessToken && accessToken.trim()) {
      const cleanToken = accessToken.trim();
      const testRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${cleanToken}`);
      const testData = await testRes.json();

      if (testData.error) {
        return NextResponse.json({
          success: false,
          error: `Meta rejected token: ${testData.error.message || 'Invalid OAuth token'}`,
        }, { status: 400 });
      }

      // Store in supabase instagram_accounts
      const supabase = getServerSupabase();
      if (supabase) {
        await supabase
          .from('instagram_accounts')
          .update({
            access_token: cleanToken,
            sync_status: 'idle',
            updated_at: new Date().toISOString(),
          })
          .eq('username', 'dr.mohit_urowala');
      }

      return NextResponse.json({
        success: true,
        message: `Successfully connected Meta Graph API for ${testData.name || 'Account'}!`,
        tokenConfigured: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Meta App credentials saved to environment variables successfully.',
      hasMetaApp: Boolean(appId && appSecret),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
