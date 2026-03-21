import { getAuthenticatedClient, errorResponse, successResponse } from '@/lib/api-helpers';

// GET /api/profile
export async function GET(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.user.id)
    .single();

  if (error) return errorResponse('Profile not found', 404);
  return successResponse(data);
}

// PATCH /api/profile
export async function PATCH(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  const updates = {};
  if (body.full_name !== undefined) updates.full_name = body.full_name;
  if (body.bio !== undefined) updates.bio = body.bio;
  if (body.phone !== undefined) updates.phone = body.phone;
  if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await auth.supabase
    .from('profiles')
    .update(updates)
    .eq('id', auth.user.id)
    .select()
    .single();

  if (error) return errorResponse(error.message);
  return successResponse(data);
}
