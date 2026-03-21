import { createServerSupabase } from '@/lib/supabase';
import { exchangeCanvaToken, getCanvaUser } from '@/lib/canva';
import { NextResponse } from 'next/server';

// GET /api/integrations/canva/callback — OAuth callback
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/admin/settings?error=canva_denied', request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/admin/settings?error=missing_params', request.url));
  }

  try {
    const tokenData = await exchangeCanvaToken(code);

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL('/admin/settings?error=token_exchange', request.url));
    }

    let accountName = 'Canva User';
    try {
      const canvaUser = await getCanvaUser(tokenData.access_token);
      accountName = canvaUser.display_name || canvaUser.email || accountName;
    } catch (e) {}

    const supabase = createServerSupabase();
    await supabase.from('connected_apps').upsert({
      user_id: state,
      provider: 'canva',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_expiry: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      account_name: accountName,
      status: 'connected',
    }, { onConflict: 'user_id,provider' });

    return NextResponse.redirect(new URL('/admin/settings?success=canva_connected', request.url));
  } catch (err) {
    console.error('Canva OAuth error:', err);
    return NextResponse.redirect(new URL('/admin/settings?error=canva_failed', request.url));
  }
}
