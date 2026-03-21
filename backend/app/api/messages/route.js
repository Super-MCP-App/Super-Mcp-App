import { getAuthenticatedClient, errorResponse, successResponse } from '@/lib/api-helpers';
import { chatCompletion } from '@/lib/nvidia';
import { getAvailableTools, executeTool } from '@/lib/mcp-registry';

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

  // Fetch User's BYOK Key and onboard status
  const { data: profile } = await auth.supabase
    .from('profiles')
    .select('nvidia_api_key, is_onboarded')
    .eq('id', auth.user.id)
    .single();

  if (!profile?.is_onboarded || !profile?.nvidia_api_key) {
    return successResponse({
      userMessage: { role: 'user', content },
      aiMessage: { role: 'assistant', content: "I am ready to help! Please complete the 'Connect Apps' onboarding and provide your NVIDIA API Key in Settings to activate AI responses." },
      tokensUsed: 0,
    }, 201);
  }

  // Retrieve user's connected MCP apps
  const { data: connectionsData } = await auth.supabase
    .from('connected_apps')
    .select('provider, status, access_token')
    .eq('user_id', auth.user.id);

  // Map Array of DB connections to an Object map (e.g. { figma: { status: 'connected', access_token: '...' } })
  const connectionsMap = (connectionsData || []).reduce((acc, row) => {
    acc[row.provider] = row;
    return acc;
  }, {});

  const availableTools = getAvailableTools(connectionsMap);

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

  // Build the message payload
  const messagesPayload = history || [];
  messagesPayload.push({ role: 'user', content });

  // Call NVIDIA AI with BYOK and connected tools
  let aiResponse = await chatCompletion(profile.nvidia_api_key, messagesPayload, {
    model: activeModel,
    tools: availableTools,
  });

  // Handle LLM Tool Calling Loop
  if (aiResponse.toolCalls?.length > 0) {
    messagesPayload.push({
      role: 'assistant',
      content: aiResponse.content,
      tool_calls: aiResponse.toolCalls
    });

    // Execute all requested MCP tools in parallel
    for (const toolCall of aiResponse.toolCalls) {
      if (toolCall.type === 'function') {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments || '{}');
        
        console.log(`Executing MCP Tool: ${functionName}`, args);
        // Dispatch to tool registry using user's explicit auth connections
        const toolResult = await executeTool(functionName, args, connectionsMap);
        
        // Push tool output context back to AI
        messagesPayload.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: functionName,
          content: JSON.stringify(toolResult),
        });
      }
    }

    // Call AI again with the new context it requested
    const finalResponse = await chatCompletion(profile.nvidia_api_key, messagesPayload, {
      model: activeModel,
    });
    
    aiResponse.content = finalResponse.content || aiResponse.content;
    aiResponse.tokensUsed += finalResponse.tokensUsed;
  }

  if (aiResponse._error) {
     return errorResponse(`AI Error: ${aiResponse._error}`, 500);
  }

  // Save AI final response
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
