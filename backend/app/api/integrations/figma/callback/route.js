import { createServerSupabase } from '@/lib/supabase';
import { exchangeFigmaToken, getFigmaUser } from '@/lib/figma';
import { NextResponse } from 'next/server';

// GET /api/integrations/figma/callback — OAuth callback
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateVal = searchParams.get('state') || '';
  const error = searchParams.get('error');

  let parsedState = {};
  if (stateVal) {
    try {
      parsedState = JSON.parse(Buffer.from(stateVal, 'base64').toString('utf-8'));
    } catch(e) { /* swallow */ }
  }
  const { u: userId, r: redirectUrl } = parsedState;

  const appRedirect = redirectUrl || 'mcpapp://mcp-auth';

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
