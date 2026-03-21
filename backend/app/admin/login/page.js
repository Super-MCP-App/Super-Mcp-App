'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      // Store token in localStorage
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(145deg, #f8f1fa 0%, #e8def9 50%, #d0bcff 100%)',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        width: 400, background: '#fff', borderRadius: 24, padding: 40,
        boxShadow: '0 20px 60px rgba(103,80,165,0.15)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: '#6750a5',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 24, fontWeight: 800, marginBottom: 16,
          }}>A</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#34313a', margin: 0 }}>Super Mcp Admin</h1>
          <p style={{ fontSize: 13, color: '#7d7983', marginTop: 4 }}>Sign in to access the admin panel</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(168,54,75,0.08)', border: '1px solid rgba(168,54,75,0.2)',
            borderRadius: 12, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: '#a8364b', fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#615d68', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@atelier-ai.com"
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: '1.5px solid #b5b0bb', fontSize: 14, outline: 'none',
                transition: 'border 0.2s', boxSizing: 'border-box',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={(e) => e.target.style.borderColor = '#6750a5'}
              onBlur={(e) => e.target.style.borderColor = '#b5b0bb'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#615d68', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: '1.5px solid #b5b0bb', fontSize: 14, outline: 'none',
                transition: 'border 0.2s', boxSizing: 'border-box',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={(e) => e.target.style.borderColor = '#6750a5'}
              onBlur={(e) => e.target.style.borderColor = '#b5b0bb'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 28,
              background: loading ? '#9885c7' : '#6750a5', color: '#fff',
              fontSize: 15, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#b5b0bb' }}>
          Admin access only • Super Mcp v1.0.0
        </p>
      </div>
    </div>
  );
}
