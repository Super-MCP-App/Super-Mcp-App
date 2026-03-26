import { getAuthenticatedClient, errorResponse, successResponse } from '@/lib/api-helpers';
import { chatCompletion } from '@/lib/nvidia';
import { getAvailableTools, executeTool } from '@/lib/mcp-registry';

// POST /api/messages — send a message and get AI response
export async function POST(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const { conversation_id, content, useMcp = true, image = null } = await request.json();

  if (!conversation_id && !content && !image) {
    return errorResponse('conversation_id and content or image are required', 400);
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
    const aiContent = "I am ready to help! Please complete the 'Connect Apps' onboarding and provide your NVIDIA API Key in Settings to activate AI responses.";
    
    // Save user message
    await auth.supabase.from('messages').insert({
      conversation_id, role: 'user', content: content || '[Image Attachment]',
    });

    // Save AI warning
    const { data: aiMessage } = await auth.supabase.from('messages').insert({
      conversation_id, role: 'assistant', content: aiContent,
    }).select().single();

    await auth.supabase.from('conversations').update({
      last_message: aiContent.substring(0, 200),
      updated_at: new Date().toISOString(),
    }).eq('id', conversation_id);

    return successResponse({
      userMessage: { role: 'user', content },
      aiMessage: aiMessage || { role: 'assistant', content: aiContent },
      tokensUsed: 0,
    }, 201);
  }

  // Retrieve user's connected MCP apps
  const { data: connectionsData } = await auth.supabase
    .from('connected_apps')
    .select('provider, status, access_token')
    .eq('user_id', auth.user.id);

  console.log(`[Messages] User ${auth.user.id} has ${connectionsData?.length || 0} connections`);
  if (connectionsData?.length > 0) {
    console.log(`[Messages] Providers: ${connectionsData.map(c => c.provider).join(', ')}`);
  }

  // Map Array of DB connections to an Object map (e.g. { figma: { status: 'connected', access_token: '...' } })
  const connectionsMap = (connectionsData || []).reduce((acc, row) => {
    acc[row.provider] = row;
    return acc;
  }, {});

  // DEBUG: Write to a file I can read
  try {
    const fs = require('fs');
    const logBatch = `[${new Date().toISOString()}] User: ${auth.user.id} | Email: ${auth.user.email} | Connections: ${Object.keys(connectionsMap).join(', ')}\n`;
    fs.appendFileSync('/tmp/mcp_chat_debug.log', logBatch);
  } catch (e) {}

  const availableTools = useMcp ? getAvailableTools(connectionsMap) : [];

  // Save user message (append [Image Attachment] if no text but image exists)
  await auth.supabase.from('messages').insert({
    conversation_id,
    role: 'user',
    content: content || '[Image Attachment]',
  });

  // Fetch conversation history for context
  const { data: rawHistory } = await auth.supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: true })
    .limit(20);

  // Filter out any stored system messages so we can dynamically inject the master prompt
  const history = (rawHistory || []).filter(msg => msg.role !== 'system');

  // Map deprecated model from database to undefined to ensure it falls back to the default working model
  let activeModel = conv.model === 'nvidia/llama-3.1-nemotron-ultra-253b-v1' ? undefined : conv.model;
  
  // Force a vision model if an image is provided
  if (image) {
    activeModel = 'meta/llama-3.2-90b-vision-instruct';
  }

  // Build the message payload
  const messagesPayload = [];
  
  // Dynamic Master System Prompt for MCP Integrations
  messagesPayload.push({
    role: 'system',
    content: `You are Super Mcp, a helpful and intelligent assistant. Be concise and friendly.

INTELLIGENT BEHAVIOR & INTEGRATIONS
- Always detect user intent first.
- If a user requests a tool action (e.g., "Show my Figma files", "Export login screen", "Analyze this design"), CALL THE TOOL immediately. Do not just explain how to do it.
- If a Figma tool returns a "NOT_CONNECTED" error, respond EXACTLY with: "Please connect your Figma account first." and include the trigger phrase "open_connect_figma_screen" somewhere in your text.
- FIGMA LIMITATION: If a user asks to CREATE a file, explain that the official Figma REST API does not allow third-party apps to create new files directly in their account. However, you can generate a detailed design structure and Tailwind code that they can use.
- Support UI/UX analysis: If the user uploads an image or shares a design, analyze it and suggest improvements proactively (spacing, colors, UX).
- Limitations: If asked to *create* a complex design via API (e.g. figma_create_frame), explain that the direct API has limitations and offer to generate a design structure or JSON guide instead.`
  });

  if (history && history.length > 0) {
    messagesPayload.push(...history);
  }

  // Format the current user message (Image formatting if applicable)
  if (image) {
    messagesPayload.push({
      role: 'user',
      content: [
        { type: "text", text: content || 'Analyze this image.' },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } }
      ]
    });
  } else {
    messagesPayload.push({ role: 'user', content });
  }

  // Call NVIDIA AI with BYOK and connected tools
  let aiResponse = await chatCompletion(profile.nvidia_api_key, messagesPayload, {
    model: activeModel,
    tools: availableTools?.length > 0 ? availableTools : undefined, // Must pass undefined if empty for some LLMs
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
