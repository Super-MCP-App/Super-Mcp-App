import { getAuthenticatedClient, errorResponse, successResponse } from '@/lib/api-helpers';

// GET /api/integrations — list all connected apps for user
export async function GET(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  try {
    const { data, error } = await auth.supabase
      .from('connected_apps')
      .select('*')
      .eq('user_id', auth.user.id);

    if (error) {
      // If table has column issues, return what we can
      console.log('Integrations error:', error.message);
      return successResponse([]);
    }
    return successResponse(data || []);
  } catch (e) {
    console.log('Integrations catch:', e.message);
    return successResponse([]);
  }
}

// DELETE /api/integrations — disconnect an app
export async function DELETE(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const { provider } = await request.json();

  const { error } = await auth.supabase
    .from('connected_apps')
    .delete()
    .eq('user_id', auth.user.id)
    .eq('provider', provider);

  if (error) return errorResponse(error.message);
  return successResponse({ message: `${provider} disconnected` });
}
