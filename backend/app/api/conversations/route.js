import { getAuthenticatedClient, errorResponse, successResponse } from '@/lib/api-helpers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/conversations — list user's conversations
export async function GET(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from('conversations')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('updated_at', { ascending: false });

  if (error) return errorResponse(error.message);
  return successResponse(data);
}

// POST /api/conversations — create new conversation
export async function POST(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const body = await request.json();

  const { data, error } = await auth.supabase
    .from('conversations')
    .insert({
      user_id: auth.user.id,
      title: body.title || 'New Conversation',
      model: body.model || 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
    })
    .select()
    .single();

  if (error) return errorResponse(error.message);

  return successResponse(data, 201);
}
