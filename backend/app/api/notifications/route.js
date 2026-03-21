import { getAuthenticatedClient, errorResponse, successResponse } from '@/lib/api-helpers';

// GET /api/notifications
export async function GET(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from('notifications')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return errorResponse(error.message);
  return successResponse(data);
}

// PATCH /api/notifications — mark notifications as read
export async function PATCH(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const { ids, markAll } = await request.json();

  let query = auth.supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', auth.user.id);

  if (!markAll && ids?.length) {
    query = query.in('id', ids);
  }

  const { error } = await query;
  if (error) return errorResponse(error.message);
  return successResponse({ message: 'Notifications updated' });
}
