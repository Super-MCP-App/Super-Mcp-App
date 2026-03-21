import React from 'react';
import Link from 'next/link';

export async function generateStaticParams() {
  return [{ policy: 'privacy' }, { policy: 'terms' }];
}

export default async function PolicyPage({ params }) {
  const resolvedParams = await params;
  const { policy } = resolvedParams;

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '60px 20px',
      fontFamily: 'Inter, sans-serif',
      lineHeight: '1.6',
      color: 'var(--on-surface)',
    },
    h1: { fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'var(--primary)' },
    lastUpdated: { fontSize: '14px', color: 'var(--outline)', marginBottom: '40px' },
    section: { marginBottom: '32px' },
    h2: { fontSize: '20px', fontWeight: '700', marginBottom: '12px' },
    ul: { paddingLeft: '20px', marginTop: '8px' },
    li: { marginBottom: '8px' },
    footer: { marginTop: '60px', paddingOfBottom: '24px', borderTop: '1px solid var(--outline-variant)', paddingTop: '24px' },
    btn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      borderRadius: '28px',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: '1.5px solid var(--outline-variant)',
      textDecoration: 'none',
      color: 'var(--on-surface)',
    }
  };

  if (policy === 'privacy') {
    return (
      <div style={styles.container}>
        <h1 style={styles.h1}>Privacy Policy</h1>
        <p style={styles.lastUpdated}>Last Updated: March 21, 2026</p>
        
        <section style={styles.section}>
          <h2 style={styles.h2}>1. Introduction</h2>
          <p>Welcome to Super Mcp. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application and services.</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>2. Information We Collect</h2>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Account Information:</strong> When you register, we collect your email address and name via Supabase Auth.</li>
            <li style={styles.li}><strong>NVIDIA API Keys:</strong> Under our "Bring Your Own Key" (BYOK) model, you provide your own NVIDIA API keys. These are stored securely in our database and are used only to authenticate your requests to NVIDIA AI services.</li>
            <li style={styles.li}><strong>MCP Connections:</strong> If you connect external services like Figma, Canva, or Kite, we store the necessary OAuth tokens to facilitate these integrations.</li>
            <li style={styles.li}><strong>Usage Data:</strong> We log the number of tokens used and API calls made to monitor system health and provide usage analytics.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>3. How We Use Your Information</h2>
          <p>We use the collected data to provide, maintain, and improve our services, including:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>Authenticating your access to AI models and connected apps.</li>
            <li style={styles.li}>Processing your requests and providing AI-generated responses.</li>
            <li style={styles.li}>Ensuring the security and integrity of our platform.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>4. Data Security</h2>
          <p>We implement industry-standard security measures, including Row Level Security (RLS) on Supabase, to ensure that your data is only accessible to you. Your API keys are strictly accessed server-side and never exposed to the frontend.</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information at any time via the Settings screen in the app or by contacting support.</p>
        </section>

        <footer style={styles.footer}>
          <Link href="/" style={styles.btn}>Back to Home</Link>
        </footer>
      </div>
    );
  }

  if (policy === 'terms') {
    return (
      <div style={styles.container}>
        <h1 style={styles.h1}>Terms of Service</h1>
        <p style={styles.lastUpdated}>Last Updated: March 21, 2026</p>

        <section style={styles.section}>
          <h2 style={styles.h2}>1. Acceptance of Terms</h2>
          <p>By accessing or using Super Mcp, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>2. Bring Your Own Key (BYOK) Model</h2>
          <p>Super Mcp operates on a "Bring Your Own Key" basis. You are responsible for obtaining and maintaining your own NVIDIA API keys and ensuring compliance with NVIDIA's terms of service. You are liable for any costs incurred on your NVIDIA account through the use of this app.</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>3. Connected Services</h2>
          <p>By connecting services like Figma, Canva, or Kite, you grant Super Mcp permission to access data from those services solely to perform the actions you request. We are not responsible for the content or privacy practices of these third-party services.</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>4. Prohibited Conduct</h2>
          <p>You agree not to use Super Mcp for any illegal purposes, to harass others, or to attempt to circumvent any security measures or usage limits of the underlying AI models.</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>5. Limitation of Liability</h2>
          <p>Super Mcp is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service or the AI-generated outputs.</p>
        </section>

        <footer style={styles.footer}>
          <Link href="/" style={styles.btn}>Back to Home</Link>
        </footer>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1 style={styles.h1}>404 - Policy Not Found</h1>
      <Link href="/" style={{ marginTop: 20 }}>Return Home</Link>
    </div>
  );
}
