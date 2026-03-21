import OpenAI from 'openai';

// Dynamic client generator using the user's personal key
function getClient(userApiKey) {
  // Fall back to server key ONLY if explicitly allowed, otherwise require user key
  const finalKey = userApiKey || process.env.NVIDIA_API_KEY;
  if (!finalKey || finalKey === 'placeholder') {
    throw new Error('NVIDIA_API_KEY_MISSING');
  }
  return new OpenAI({
    apiKey: finalKey,
    baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
  });
}

export async function chatCompletion(apiKey, messages, options = {}) {
  const {
    model = 'meta/llama-3.1-8b-instruct',
    temperature = 0.7,
    maxTokens = 2048,
    stream = false,
    tools = undefined, // Array of MCP tools 
  } = options;

  let nvidia;
  try {
    nvidia = getClient(apiKey);
  } catch (err) {
    if (err.message === 'NVIDIA_API_KEY_MISSING') {
      return { _error: 'API_KEY_MISSING' };
    }
  }

  try {
    const response = await nvidia.chat.completions.create({
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content, ...(m.tool_calls && { tool_calls: m.tool_calls }), ...(m.name && { name: m.name }), ...(m.tool_call_id && { tool_call_id: m.tool_call_id }) })),
      temperature,
      max_tokens: maxTokens,
      stream,
      ...(tools && tools.length > 0 && { tools, tool_choice: 'auto' }),
    });

    if (stream) return response;

    const msg = response.choices[0]?.message;
    return {
      content: msg?.content || '',
      toolCalls: msg?.tool_calls || [],
      tokensUsed: response.usage?.total_tokens || 0,
      model: response.model,
    };
  } catch (error) {
    console.error('NVIDIA API Error:', error.message);
    return { _error: error.message };
  }
}

export async function streamChatCompletion(apiKey, messages, options = {}) {
  return chatCompletion(apiKey, messages, { ...options, stream: true });
}

