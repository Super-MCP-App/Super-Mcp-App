import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const { data: users, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users?.length || 0} registered users (live from Supabase)</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="search-bar">
            <span>🔍</span>
            <input placeholder="Search users..." />
          </div>
        </div>
      </div>

      <div className="card">
        {error ? (
          <div style={{ padding: 20, color: 'var(--error)' }}>Error loading users: {error.message}</div>
        ) : users && users.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: 18, objectFit: 'cover' }} />
                        ) : (
                          <div style={{
                            width: 36, height: 36, borderRadius: 18,
                            background: 'var(--primary-container)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, color: 'var(--on-primary-container)', fontSize: 14,
                          }}>
                            {(user.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.full_name || 'No Name'}</div>
                          <div style={{ fontSize: 12, color: 'var(--outline)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${user.plan === 'pro' ? 'badge-primary' : user.plan === 'enterprise' ? 'badge-warning' : 'badge-outline'}`}>
                        {user.plan || 'free'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-warning' : 'badge-outline'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{user.phone || '-'}</td>
                    <td style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--outline)' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>👥</p>
            <p style={{ fontWeight: 600, fontSize: 16 }}>No users yet</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Users will appear here when they register via the mobile app</p>
          </div>
        )}
      </div>
    </>
  );
}
