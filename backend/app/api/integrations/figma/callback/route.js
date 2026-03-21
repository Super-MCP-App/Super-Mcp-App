import { createServerSupabase } from '@/lib/supabase';
import { exchangeFigmaToken, getFigmaUser } from '@/lib/figma';
import { NextResponse } from 'next/server';

// GET /api/integrations/figma/callback — OAuth callback
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // user_id
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/admin/settings?error=figma_denied', request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/admin/settings?error=missing_params', request.url));
  }

  try {
    // Exchange code for tokens
    const tokenData = await exchangeFigmaToken(code);

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL('/admin/settings?error=token_exchange', request.url));
    }

    // Get Figma user info
    const figmaUser = await getFigmaUser(tokenData.access_token);

    // Store in connected_apps using admin client
    const supabase = createServerSupabase();
    await supabase.from('connected_apps').upsert({
      user_id: state,
      provider: 'figma',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_expiry: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      account_name: figmaUser.handle || figmaUser.email || 'Figma User',
      status: 'connected',
      metadata: { figma_user_id: figmaUser.id },
    }, { onConflict: 'user_id,provider' });

    return NextResponse.redirect(new URL('/admin/settings?success=figma_connected', request.url));
  } catch (err) {
    console.error('Figma OAuth error:', err);
    return NextResponse.redirect(new URL('/admin/settings?error=figma_failed', request.url));
  }
}
