import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export default async function ConversationsPage() {
  // Fetch conversations without join (avoids relationship error)
  const { data: conversations, error } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  // Fetch all profiles for user lookup
  const { data: profiles } = await supabaseAdmin.from('profiles').select('id, full_name, email');
  const profileMap = {};
  (profiles || []).forEach(p => { profileMap[p.id] = p; });

  // Get message counts
  const convIds = (conversations || []).map(c => c.id);
  let messageCounts = {};
  if (convIds.length > 0) {
    const { data: msgs } = await supabaseAdmin
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', convIds);
    (msgs || []).forEach(m => { messageCounts[m.conversation_id] = (messageCounts[m.conversation_id] || 0) + 1; });
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Conversations</h1>
          <p className="page-subtitle">{conversations?.length || 0} total conversations (live)</p>
        </div>
      </div>

      <div className="card">
        {error ? (
          <div style={{ padding: 20, color: 'var(--error)' }}>Error: {error.message}</div>
        ) : conversations && conversations.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Conversation</th><th>User</th><th>Messages</th><th>Model</th><th>Last Active</th></tr>
              </thead>
              <tbody>
                {conversations.map((conv) => (
                  <tr key={conv.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{conv.title}</div>
                      {conv.last_message && <div style={{ fontSize: 12, color: 'var(--outline)', marginTop: 2, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.last_message}</div>}
                    </td>
                    <td style={{ color: 'var(--on-surface-variant)' }}>{profileMap[conv.user_id]?.full_name || 'Unknown'}</td>
                    <td>{messageCounts[conv.id] || 0}</td>
                    <td><span className="badge badge-primary">{(conv.model || 'default').split('/').pop()}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--outline)' }}>{timeAgo(conv.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--outline)' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>💬</p>
            <p style={{ fontWeight: 600, fontSize: 16 }}>No conversations yet</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Conversations appear as users chat with AI</p>
          </div>
        )}
      </div>
    </>
  );
}

function timeAgo(d) { if (!d) return ''; const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 1) return 'Just now'; if (m < 60) return m + 'm ago'; const h = Math.floor(m / 60); if (h < 24) return h + 'h ago'; return Math.floor(h / 24) + 'd ago'; }
