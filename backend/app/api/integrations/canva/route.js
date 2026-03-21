import { getAuthenticatedClient, errorResponse, successResponse } from '@/lib/api-helpers';
import { getCanvaAuthUrl, listCanvaDesigns, getCanvaDesign, createCanvaDesign, exportCanvaDesign } from '@/lib/canva';

// GET /api/integrations/canva
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  // Start OAuth
  if (action === 'auth') {
    const url = getCanvaAuthUrl(auth.user.id);
    return successResponse({ authUrl: url });
  }

  // Get connected status
  const { data: app } = await auth.supabase
    .from('connected_apps')
    .select('*')
    .eq('user_id', auth.user.id)
    .eq('provider', 'canva')
    .single();

  if (!app) return errorResponse('Canva not connected', 404);

  try {
    const designs = await listCanvaDesigns(app.access_token);
    return successResponse({ connected: true, designs, account: app.account_name });
  } catch (err) {
    return errorResponse('Canva connection expired', 401);
  }
}

// POST /api/integrations/canva — actions: create, export
export async function POST(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const { action, designId, format, templateData } = await request.json();

  const { data: app } = await auth.supabase
    .from('connected_apps')
    .select('access_token')
    .eq('user_id', auth.user.id)
    .eq('provider', 'canva')
    .single();

  if (!app) return errorResponse('Canva not connected', 404);

  try {
    if (action === 'getDesign') {
      const design = await getCanvaDesign(app.access_token, designId);
      return successResponse(design);
    }
    if (action === 'create') {
      const design = await createCanvaDesign(app.access_token, templateData);
      return successResponse(design);
    }
    if (action === 'export') {
      const exported = await exportCanvaDesign(app.access_token, designId, format);
      return successResponse(exported);
    }
    return errorResponse('Unknown action', 400);
  } catch (err) {
    return errorResponse(err.message);
  }
}
