import { getAuthenticatedClient, errorResponse, successResponse } from '@/lib/api-helpers';
import { getFigmaAuthUrl, exchangeFigmaToken, getFigmaUser, getFigmaFile, getFigmaImages } from '@/lib/figma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// GET /api/integrations/figma — start OAuth or get Figma data
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // Start OAuth
  if (action === 'auth') {
    const auth = await getAuthenticatedClient(request);
    if (auth.error) return auth.error;
    
    const appRedirect = searchParams.get('redirect_url') || 'mcpapp://mcp-auth';
    const stateObj = JSON.stringify({ u: auth.user.id, r: appRedirect });
    const url = getFigmaAuthUrl(stateObj);
    return successResponse({ authUrl: url });
  }

  // List user's Figma data
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const { data: app } = await auth.supabase
    .from('connected_apps')
    .select('*')
    .eq('user_id', auth.user.id)
    .eq('provider', 'figma')
    .single();

  if (!app) return errorResponse('Figma not connected', 404);

  try {
    const user = await getFigmaUser(app.access_token);
    return successResponse({ connected: true, user, account: app.account_name });
  } catch (err) {
    return errorResponse('Figma connection expired', 401);
  }
}

// POST /api/integrations/figma — actions: get file, get images
export async function POST(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const { action, fileKey, nodeIds } = await request.json();

  const { data: app } = await auth.supabase
    .from('connected_apps')
    .select('access_token')
    .eq('user_id', auth.user.id)
    .eq('provider', 'figma')
    .single();

  if (!app) return errorResponse('Figma not connected', 404);

  try {
    if (action === 'getFile') {
      const file = await getFigmaFile(app.access_token, fileKey);
      return successResponse(file);
    }
    if (action === 'getImages') {
      const images = await getFigmaImages(app.access_token, fileKey, nodeIds);
      return successResponse(images);
    }
    return errorResponse('Unknown action', 400);
  } catch (err) {
    return errorResponse(err.message);
  }
}
