import { getAuthenticatedClient, errorResponse, successResponse } from '@/lib/api-helpers';
import { chatCompletion } from '@/lib/nvidia';

// POST /api/messages — send a message and get AI response
export async function POST(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const { conversation_id, content } = await request.json();

  if (!conversation_id || !content) {
    return errorResponse('conversation_id and content are required', 400);
  }

  // Verify conversation belongs to user
  const { data: conv, error: convError } = await auth.supabase
    .from('conversations')
    .select('id, model')
    .eq('id', conversation_id)
    .eq('user_id', auth.user.id)
    .single();

  if (convError) return errorResponse('Conversation not found', 404);

  // Save user message
  await auth.supabase.from('messages').insert({
    conversation_id,
    role: 'user',
    content,
  });

  // Fetch conversation history for context
  const { data: history } = await auth.supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: true })
    .limit(20);

  // Map deprecated model from database to undefined to ensure it falls back to the default working model
  const activeModel = conv.model === 'nvidia/llama-3.1-nemotron-ultra-253b-v1' ? undefined : conv.model;

  // Call NVIDIA AI
  const aiResponse = await chatCompletion(history || [{ role: 'user', content }], {
    model: activeModel,
  });

  // Save AI response
  const { data: aiMessage } = await auth.supabase
    .from('messages')
    .insert({
      conversation_id,
      role: 'assistant',
      content: aiResponse.content,
      tokens_used: aiResponse.tokensUsed,
    })
    .select()
    .single();

  // Update conversation last_message and timestamp
  await auth.supabase
    .from('conversations')
    .update({
      last_message: aiResponse.content.substring(0, 200),
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversation_id);

  // Log usage
  await auth.supabase.from('usage_logs').insert({
    user_id: auth.user.id,
    tokens: aiResponse.tokensUsed,
    api_calls: 1,
  });

  return successResponse({
    userMessage: { role: 'user', content },
    aiMessage: aiMessage || { role: 'assistant', content: aiResponse.content },
    tokensUsed: aiResponse.tokensUsed,
  }, 201);
}
