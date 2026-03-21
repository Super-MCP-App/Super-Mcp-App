import { getAuthenticatedClient, errorResponse, successResponse } from '@/lib/api-helpers';
import { chatCompletion } from '@/lib/nvidia';
import { getAvailableTools, executeTool } from '@/lib/mcp-registry';

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

  if (!body.title) return errorResponse('Title prompt is required', 400);

  // Fetch User's BYOK Key
  const { data: profile } = await auth.supabase
    .from('profiles')
    .select('nvidia_api_key, is_onboarded')
    .eq('id', auth.user.id)
    .single();

  if (!profile?.is_onboarded || !profile?.nvidia_api_key) {
    return errorResponse('NVIDIA API Key required. Please complete Onboarding.', 403);
  }

  // Retrieve user's connected MCP apps
  const { data: connectionsData } = await auth.supabase
    .from('connected_apps')
    .select('provider, status, access_token')
    .eq('user_id', auth.user.id);

  const connectionsMap = (connectionsData || []).reduce((acc, row) => {
    acc[row.provider] = row;
    return acc;
  }, {});
  const availableTools = getAvailableTools(connectionsMap);

  // Generate Task Breakdown via AI
  const systemPrompt = `You are an AI Task Generator. The user will provide a high-level task or goal. Your job is to generate a detailed description with step-by-step subtasks. If connected tools (Figma, Canva, Kite) are available and relevant to fetching context for the task, invoke them FIRST to gather data before writing the detailed plan. Keep formatting clean using markdown checklists.`;

  const messagesPayload = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: body.title }
  ];

  let aiResponse = await chatCompletion(profile.nvidia_api_key, messagesPayload, {
    model: 'meta/llama-3.1-405b-instruct', // Use a smart model for reasoning
    tools: availableTools,
  });

  // Handle LLM Tool Calling Loop
  if (aiResponse.toolCalls?.length > 0) {
    messagesPayload.push({
      role: 'assistant',
      content: aiResponse.content || '',
      tool_calls: aiResponse.toolCalls
    });

    for (const toolCall of aiResponse.toolCalls) {
      if (toolCall.type === 'function') {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments || '{}');
        
        console.log(`Executing MCP Tool inside Tasks Loop: ${functionName}`, args);
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

    // Call AI again to finalize the task plan
    const finalResponse = await chatCompletion(profile.nvidia_api_key, messagesPayload, {
      model: 'meta/llama-3.1-405b-instruct',
    });
    
    aiResponse.content = finalResponse.content || aiResponse.content;
    aiResponse.tokensUsed += (finalResponse.tokensUsed || 0);
  }

  if (aiResponse._error) {
     return errorResponse(`AI Error: ${aiResponse._error}`, 500);
  }

  // Save the full structured AI response to the DB as the Task Description
  const { data, error } = await auth.supabase
    .from('tasks')
    .insert({
      user_id: auth.user.id,
      title: body.title,
      description: aiResponse.content,
      model: 'meta/llama-3.1-405b-instruct',
      tokens_used: aiResponse.tokensUsed,
    })
    .select()
    .single();

  if (error) return errorResponse(error.message);
  return successResponse(data, 201);
}
