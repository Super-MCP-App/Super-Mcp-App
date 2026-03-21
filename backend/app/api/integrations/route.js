import { getAuthenticatedClient, errorResponse, successResponse } from '@/lib/api-helpers';

const AVAILABLE_PROVIDERS = [
  { provider: 'figma', provider_display_name: 'Figma', description: 'Access and export your Figma designs natively via AI.', scopes: 'files:read', status: 'available' },
  { provider: 'canva', provider_display_name: 'Canva', description: 'Export designs from your Canva account.', scopes: 'design:read', status: 'available' },
  { provider: 'github', provider_display_name: 'GitHub', description: 'Manage repositories, issues, and pull requests.', scopes: 'repo, user', status: 'coming_soon' },
  { provider: 'slack', provider_display_name: 'Slack', description: 'Interact with your Slack channels and messages.', scopes: 'chat:write, channels:read', status: 'coming_soon' },
  { provider: 'discord', provider_display_name: 'Discord', description: 'Moderate and engage directly from your AI.', scopes: 'bot', status: 'coming_soon' },
  { provider: 'google_drive', provider_display_name: 'Google Drive', description: 'Search and read documents from your Google Drive.', scopes: 'drive.readonly', status: 'coming_soon' },
  { provider: 'notion', provider_display_name: 'Notion', description: 'Query your Notion workspace directly.', scopes: 'read_content', status: 'coming_soon' },
  { provider: 'kite', provider_display_name: 'Kite', description: 'Connect your financial data insights securely.', scopes: 'portfolio:read', status: 'coming_soon' },
  { provider: 'custom', provider_display_name: 'Custom Server', description: 'Connect any manual MCP standard server.', scopes: 'all', status: 'coming_soon' },
];

// GET /api/integrations — list all connected apps for user
export async function GET(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  try {
    const { data } = await auth.supabase
      .from('connected_apps')
      .select('*')
      .eq('user_id', auth.user.id);

    const connectedMap = (data || []).reduce((acc, app) => {
      acc[app.provider] = app;
      return acc;
    }, {});

    const result = AVAILABLE_PROVIDERS.map(provider => {
      if (connectedMap[provider.provider] && connectedMap[provider.provider].status === 'connected') {
        return {
          ...provider,
          ...connectedMap[provider.provider],
          status: 'connected'
        };
      }
      return provider;
    });

    return successResponse(result);
  } catch (e) {
    console.log('Integrations catch:', e.message);
    return successResponse(AVAILABLE_PROVIDERS);
  }
}

// DELETE /api/integrations — disconnect an app
export async function DELETE(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const { provider } = await request.json();

  const { error } = await auth.supabase
    .from('connected_apps')
    .delete()
    .eq('user_id', auth.user.id)
    .eq('provider', provider);

  if (error) return errorResponse(error.message);
  return successResponse({ message: `${provider} disconnected` });
}
