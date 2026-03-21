import { getAuthenticatedClient, errorResponse, successResponse } from '@/lib/api-helpers';

// GET /api/tasks
export async function GET(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = auth.supabase
    .from('tasks')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return errorResponse(error.message);
  return successResponse(data);
}

// POST /api/tasks
export async function POST(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const body = await request.json();

  const { data, error } = await auth.supabase
    .from('tasks')
    .insert({
      user_id: auth.user.id,
      title: body.title,
      description: body.description || '',
      model: body.model || 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
    })
    .select()
    .single();

  if (error) return errorResponse(error.message);
  return successResponse(data, 201);
}
