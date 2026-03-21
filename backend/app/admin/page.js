import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { count: totalUsers } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
  const { count: totalConversations } = await supabaseAdmin.from('conversations').select('*', { count: 'exact', head: true });
  const { count: totalTasks } = await supabaseAdmin.from('tasks').select('*', { count: 'exact', head: true });

  const { data: recentUsers } = await supabaseAdmin.from('profiles').select('full_name, email, created_at, plan').order('created_at', { ascending: false }).limit(5);
  const { data: recentConversations } = await supabaseAdmin.from('conversations').select('title, updated_at, user_id').order('updated_at', { ascending: false }).limit(5);

  const { data: usageLogs } = await supabaseAdmin.from('usage_logs').select('tokens, api_calls, date').order('date', { ascending: true }).limit(7);
  const totalTokens = (usageLogs || []).reduce((s, l) => s + (l.tokens || 0), 0);

  // Fetch profiles for lookup
  const { data: profiles } = await supabaseAdmin.from('profiles').select('id, full_name');
  const profileMap = {};
  (profiles || []).forEach(p => { profileMap[p.id] = p; });

  // Activity feed
  const activities = [];
  (recentUsers || []).forEach(u => activities.push({ icon: '👤', text: `${u.full_name || 'User'} registered`, time: timeAgo(u.created_at), bg: '#e8def9' }));
  (recentConversations || []).forEach(c => activities.push({ icon: '💬', text: `"${c.title}" by ${profileMap[c.user_id]?.full_name || 'user'}`, time: timeAgo(c.updated_at), bg: '#d1fae5' }));

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time data from Supabase</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/admin" className="btn btn-outline">↻ Refresh</a>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Users', value: totalUsers || 0 },
          { label: 'Conversations', value: totalConversations || 0 },
          { label: 'Tasks', value: totalTasks || 0 },
          { label: 'Tokens Used', value: formatNumber(totalTokens) },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-change positive">Live</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Token Usage</h3>
          {usageLogs && usageLogs.length > 0 ? (
            <>
              <div className="chart-bar">
                {usageLogs.map((log, i) => {
                  const max = Math.max(...usageLogs.map(l => l.tokens || 1));
                  return <div key={i} className="chart-bar-item" style={{ height: `${Math.max(((log.tokens || 0) / max) * 100, 5)}%` }} title={`${log.date}: ${log.tokens}`} />;
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--outline)' }}>
                {usageLogs.map((l, i) => <span key={i}>{l.date?.slice(5)}</span>)}
              </div>
            </>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--outline)' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📊</p>
              <p>No usage data yet — start chatting in the app!</p>
            </div>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Activity</h3>
          {activities.length > 0 ? activities.slice(0, 8).map((a, i) => (
            <div key={i} className="activity-item">
              <div className="activity-icon" style={{ background: a.bg }}>{a.icon}</div>
              <div>
                <div className="activity-text">{a.text}</div>
                <div className="activity-time">{a.time}</div>
              </div>
            </div>
          )) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--outline)' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
              <p>No activity yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function timeAgo(d) { if (!d) return ''; const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 1) return 'Just now'; if (m < 60) return m + 'm ago'; const h = Math.floor(m / 60); if (h < 24) return h + 'h ago'; return Math.floor(h / 24) + 'd ago'; }
function formatNumber(n) { if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'; if (n >= 1000) return (n / 1000).toFixed(1) + 'K'; return String(n); }
