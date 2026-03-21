import Link from 'next/link';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background)',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        background: 'var(--primary)',
        color: 'var(--on-primary)',
        width: 64,
        height: 64,
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        fontWeight: 800,
        marginBottom: 24,
      }}>A</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Super Mcp</h1>
      <p style={{ color: 'var(--on-surface-variant)', marginBottom: 32 }}>Backend API & Admin Panel</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/admin" className="btn btn-primary">Admin Panel →</Link>
        <a href="/api/auth/login" className="btn btn-outline">API Docs</a>
      </div>
      <div style={{
        marginTop: 48,
        padding: 20,
        background: 'var(--surface-container-low)',
        borderRadius: 12,
        maxWidth: 400,
        width: '100%',
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--outline)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>API Base URL</p>
        <code style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--primary)' }}>http://localhost:3000/api</code>
      </div>
    </div>
  );
}
