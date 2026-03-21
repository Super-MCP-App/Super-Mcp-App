import { getAuthenticatedClient, errorResponse, successResponse } from '@/lib/api-helpers';

// GET /api/tasks/[id]
export async function GET(request, { params }) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;
  const { id } = await params;

  const { data, error } = await auth.supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .single();

  if (error) return errorResponse('Task not found', 404);
  return successResponse(data);
}

// PATCH /api/tasks/[id]
export async function PATCH(request, { params }) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = await request.json();

  const updates = {};
  if (body.status) updates.status = body.status;
  if (body.progress !== undefined) updates.progress = body.progress;
  if (body.result) updates.result = body.result;
  if (body.status === 'completed' || body.status === 'failed') {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await auth.supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .select()
    .single();

  if (error) return errorResponse(error.message);
  return successResponse(data);
}

// DELETE /api/tasks/[id]
export async function DELETE(request, { params }) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;
  const { id } = await params;

  const { error } = await auth.supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', auth.user.id);

  if (error) return errorResponse(error.message);
  return successResponse({ message: 'Deleted' });
}
