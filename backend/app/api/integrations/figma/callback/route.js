import { createServerSupabase } from '@/lib/supabase';
import { exchangeFigmaToken, getFigmaUser } from '@/lib/figma';
import { NextResponse } from 'next/server';

// GET /api/integrations/figma/callback — OAuth callback
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateRaw = searchParams.get('state'); // JSON string { u: user_id, r: redirectUrl }
  const error = searchParams.get('error');

  let userId = stateRaw;
  let appRedirect = 'mcpapp://mcp-auth';
  try {
    const parsed = JSON.parse(stateRaw);
    userId = parsed.u;
    if (parsed.r) appRedirect = parsed.r;
  } catch (e) {
    // legacy string fallback
  }

  if (error) {
    return NextResponse.redirect(`${appRedirect}?status=error&provider=figma&reason=figma_denied`);
  }

  if (!code || !userId) {
    return NextResponse.redirect(`${appRedirect}?status=error&provider=figma&reason=missing_params`);
  }

  try {
    // Exchange code for tokens
    const tokenData = await exchangeFigmaToken(code);

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${appRedirect}?status=error&provider=figma&reason=token_exchange`);
    }

    // Get Figma user info
    const figmaUser = await getFigmaUser(tokenData.access_token);

    // Store in connected_apps using admin client
    const supabase = createServerSupabase();
    await supabase.from('connected_apps').upsert({
      user_id: userId,
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

    return NextResponse.redirect(`${appRedirect}?status=success&provider=figma`);
  } catch (err) {
    console.error('Figma OAuth error:', err);
    return NextResponse.redirect(`${appRedirect}?status=error&provider=figma&reason=figma_failed`);
  }
}
