import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  // Fetch tasks without join (avoids relationship error)
  const { data: tasks, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch profiles separately for lookup
  const { data: profiles } = await supabaseAdmin.from('profiles').select('id, full_name');
  const profileMap = {};
  (profiles || []).forEach(p => { profileMap[p.id] = p; });

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks?.length || 0} total tasks (live)</p>
        </div>
      </div>

      <div className="card">
        {error ? (
          <div style={{ padding: 20, color: 'var(--error)' }}>Error: {error.message}</div>
        ) : tasks && tasks.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Task</th><th>User</th><th>Status</th><th>Progress</th><th>Tokens</th><th>Created</th></tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{task.title}</div>
                      {task.description && <div style={{ fontSize: 12, color: 'var(--outline)', marginTop: 2 }}>{task.description.slice(0, 60)}</div>}
                    </td>
                    <td style={{ color: 'var(--on-surface-variant)' }}>{profileMap[task.user_id]?.full_name || 'Unknown'}</td>
                    <td>
                      <span className={`badge ${task.status === 'running' ? 'badge-primary' : task.status === 'completed' ? 'badge-success' : 'badge-error'}`}>{task.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 80, height: 6, borderRadius: 3, background: 'var(--surface-container)' }}>
                          <div style={{ width: `${(task.progress || 0) * 100}%`, height: '100%', borderRadius: 3, background: task.status === 'failed' ? 'var(--error)' : 'var(--primary)' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{Math.round((task.progress || 0) * 100)}%</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{formatTokens(task.tokens_used)}</td>
                    <td style={{ fontSize: 13, color: 'var(--outline)' }}>{task.created_at ? new Date(task.created_at).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--outline)' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>✅</p>
            <p style={{ fontWeight: 600, fontSize: 16 }}>No tasks yet</p>
          </div>
        )}
      </div>
    </>
  );
}

function formatTokens(n) { if (!n) return '0'; if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'; if (n >= 1000) return (n / 1000).toFixed(1) + 'K'; return String(n); }
