import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const { count: totalUsers } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
  const { count: totalConversations } = await supabaseAdmin.from('conversations').select('*', { count: 'exact', head: true });
  const { count: totalTasks } = await supabaseAdmin.from('tasks').select('*', { count: 'exact', head: true });

  const { data: usageLogs } = await supabaseAdmin.from('usage_logs').select('*').order('date', { ascending: true }).limit(14);
  const totalTokens = (usageLogs || []).reduce((s, l) => s + (l.tokens || 0), 0);
  const totalApiCalls = (usageLogs || []).reduce((s, l) => s + (l.api_calls || 0), 0);

  // Fetch profiles (no join)
  const { data: topUsers } = await supabaseAdmin.from('profiles').select('full_name, email, plan, role').limit(10);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Real-time platform metrics</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Tokens', value: formatN(totalTokens) },
          { label: 'API Calls', value: formatN(totalApiCalls) },
          { label: 'Total Users', value: totalUsers || 0 },
          { label: 'Conversations', value: totalConversations || 0 },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Token Usage</h3>
          {usageLogs && usageLogs.length > 0 ? (
            <>
              <div className="chart-bar">
                {usageLogs.map((l, i) => {
                  const max = Math.max(...usageLogs.map(x => x.tokens || 1));
                  return <div key={i} className="chart-bar-item" style={{ height: `${Math.max(((l.tokens || 0) / max) * 100, 5)}%` }} />;
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--outline)' }}>
                {usageLogs.map((l, i) => <span key={i}>{l.date?.slice(5)}</span>)}
              </div>
            </>
          ) : <div style={{ padding: 40, textAlign: 'center', color: 'var(--outline)' }}>📊 No token data yet</div>}
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>API Calls</h3>
          {usageLogs && usageLogs.length > 0 ? (
            <>
              <div className="chart-bar">
                {usageLogs.map((l, i) => {
                  const max = Math.max(...usageLogs.map(x => x.api_calls || 1));
                  return <div key={i} className="chart-bar-item" style={{ height: `${Math.max(((l.api_calls || 0) / max) * 100, 5)}%`, background: 'var(--secondary-container)' }} />;
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--outline)' }}>
                {usageLogs.map((l, i) => <span key={i}>{l.date?.slice(5)}</span>)}
              </div>
            </>
          ) : <div style={{ padding: 40, textAlign: 'center', color: 'var(--outline)' }}>📊 No API data yet</div>}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>All Users</h3>
        {topUsers && topUsers.length > 0 ? (
          <div className="table-container">
            <table>
              <thead><tr><th>#</th><th>User</th><th>Email</th><th>Role</th><th>Plan</th></tr></thead>
              <tbody>
                {topUsers.map((u, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>#{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{u.full_name || 'Unknown'}</td>
                    <td style={{ color: 'var(--outline)' }}>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-outline'}`}>{u.role || 'user'}</span></td>
                    <td><span className={`badge ${u.plan === 'pro' ? 'badge-primary' : 'badge-outline'}`}>{u.plan || 'free'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div style={{ padding: 40, textAlign: 'center', color: 'var(--outline)' }}>No users yet</div>}
      </div>
    </>
  );
}

function formatN(n) { if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'; if (n >= 1000) return (n / 1000).toFixed(1) + 'K'; return String(n); }
