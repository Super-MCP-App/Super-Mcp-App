import OpenAI from 'openai';

// NVIDIA AI API is OpenAI-compatible
const nvidia = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || 'placeholder',
  baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
});

export async function chatCompletion(messages, options = {}) {
  const {
    model = 'meta/llama-3.1-8b-instruct',
    temperature = 0.7,
    maxTokens = 2048,
    stream = false,
  } = options;

  try {
    const response = await nvidia.chat.completions.create({
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature,
      max_tokens: maxTokens,
      stream,
    });

    if (stream) return response;

    return {
      content: response.choices[0]?.message?.content || "Sorry, I couldn't generate a response. Please try again.",
      tokensUsed: response.usage?.total_tokens || 0,
      model: response.model,
    };
  } catch (error) {
    console.error('NVIDIA API Error:', error.message);
    // Fallback response if API key is not set
    return {
      content: "I'm your AI assistant. To enable full AI responses, please configure the NVIDIA API key in the backend environment variables.",
      tokensUsed: 0,
      model: 'fallback',
    };
  }
}

export async function streamChatCompletion(messages, options = {}) {
  return chatCompletion(messages, { ...options, stream: true });
}
