import { getAuthenticatedClient, errorResponse, successResponse } from '@/lib/api-helpers';

// GET /api/usage — get usage stats
export async function GET(request) {
  const auth = await getAuthenticatedClient(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '7');

  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get usage logs
  const { data: logs } = await auth.supabase
    .from('usage_logs')
    .select('*')
    .eq('user_id', auth.user.id)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: true });

  // Get totals
  const { data: conversations } = await auth.supabase
    .from('conversations')
    .select('id', { count: 'exact' })
    .eq('user_id', auth.user.id);

  const { data: tasks } = await auth.supabase
    .from('tasks')
    .select('id', { count: 'exact' })
    .eq('user_id', auth.user.id);

  const { data: apps } = await auth.supabase
    .from('connected_apps')
    .select('id', { count: 'exact' })
    .eq('user_id', auth.user.id)
    .eq('status', 'connected');

  const totalTokens = (logs || []).reduce((sum, l) => sum + (l.tokens || 0), 0);
  const totalApiCalls = (logs || []).reduce((sum, l) => sum + (l.api_calls || 0), 0);

  return successResponse({
    summary: {
      totalTokens,
      totalApiCalls,
      totalConversations: conversations?.length || 0,
      totalTasks: tasks?.length || 0,
      connectedApps: apps?.length || 0,
    },
    daily: logs || [],
  });
}
