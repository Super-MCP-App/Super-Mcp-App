'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/conversations', label: 'Conversations', icon: '💬' },
  { href: '/admin/tasks', label: 'Tasks', icon: '✅' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    if (token && userData) {
      setIsAuth(true);
      try { setUser(JSON.parse(userData)); } catch {}
    }
    setChecking(false);
  }, [pathname]);

  useEffect(() => {
    if (!checking && !isAuth && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [checking, isAuth, pathname]);

  // Don't apply layout to login page
  if (pathname === '/admin/login') {
    return children;
  }

  if (checking || !isAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <p style={{ color: '#7d7983' }}>{checking ? 'Loading...' : 'Redirecting to login...'}</p>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>A</span>
          Super Mcp
        </div>
        <nav>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--outline-variant)', marginTop: 'auto' }}>
          {user && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'var(--outline)' }}>{user.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 10,
              background: 'rgba(168,54,75,0.06)', border: '1px solid rgba(168,54,75,0.15)',
              color: '#a8364b', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
