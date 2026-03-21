import { getAuthenticatedClient, errorResponse, successResponse } from '@/lib/api-helpers';

// GET /api/conversations/[id] — get conversation with messages
export async function GET(request, { params }) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;
  const { id } = await params;

  const { data: conversation, error: convError } = await auth.supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .single();

  if (convError) return errorResponse('Conversation not found', 404);

  const { data: messages } = await auth.supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });

  return successResponse({ ...conversation, messages: messages || [] });
}

// DELETE /api/conversations/[id]
export async function DELETE(request, { params }) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;
  const { id } = await params;

  const { error } = await auth.supabase
    .from('conversations')
    .delete()
    .eq('id', id)
    .eq('user_id', auth.user.id);

  if (error) return errorResponse(error.message);
  return successResponse({ message: 'Deleted' });
}
