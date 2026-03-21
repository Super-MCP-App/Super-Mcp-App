import React from 'react';
import Link from 'next/link';

export async function generateStaticParams() {
  return [{ policy: 'privacy' }, { policy: 'terms' }];
}

export default async function PolicyPage({ params }) {
  const { policy } = await params;

  if (policy === 'privacy') {
    return (
      <div className="policy-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: March 21, 2026</p>
        
        <section>
          <h2>1. Introduction</h2>
          <p>Welcome to Super Mcp. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application and services.</p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <ul>
            <li><strong>Account Information:</strong> When you register, we collect your email address and name via Supabase Auth.</li>
            <li><strong>NVIDIA API Keys:</strong> Under our "Bring Your Own Key" (BYOK) model, you provide your own NVIDIA API keys. These are stored securely in our database and are used only to authenticate your requests to NVIDIA AI services.</li>
            <li><strong>MCP Connections:</strong> If you connect external services like Figma, Canva, or Kite, we store the necessary OAuth tokens to facilitate these integrations.</li>
            <li><strong>Usage Data:</strong> We log the number of tokens used and API calls made to monitor system health and provide usage analytics.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the collected data to provide, maintain, and improve our services, including:</p>
          <ul>
            <li>Authenticating your access to AI models and connected apps.</li>
            <li>Processing your requests and providing AI-generated responses.</li>
            <li>Ensuring the security and integrity of our platform.</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>We implement industry-standard security measures, including Row Level Security (RLS) on Supabase, to ensure that your data is only accessible to you. Your API keys are strictly accessed server-side and never exposed to the frontend.</p>
        </section>

        <section>
          <h2>5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information at any time via the Settings screen in the app or by contacting support.</p>
        </section>

        <footer>
          <Link href="/" className="btn btn-outline">Back to Home</Link>
        </footer>

        <style jsx>{`
          .policy-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 60px 20px;
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: var(--on-surface);
          }
          h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; color: var(--primary); }
          .last-updated { font-size: 14px; color: var(--outline); margin-bottom: 40px; }
          section { margin-bottom: 32px; }
          h2 { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
          ul { padding-left: 20px; margin-top: 8px; }
          li { margin-bottom: 8px; }
          footer { margin-top: 60px; padding-top: 24px; border-top: 1px solid var(--outline-variant); }
        `}</style>
      </div>
    );
  }

  if (policy === 'terms') {
    return (
      <div className="policy-container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: March 21, 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using Super Mcp, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.</p>
        </section>

        <section>
          <h2>2. Bring Your Own Key (BYOK) Model</h2>
          <p>Super Mcp operates on a "Bring Your Own Key" basis. You are responsible for obtaining and maintaining your own NVIDIA API keys and ensuring compliance with NVIDIA's terms of service. You are liable for any costs incurred on your NVIDIA account through the use of this app.</p>
        </section>

        <section>
          <h2>3. Connected Services</h2>
          <p>By connecting services like Figma, Canva, or Kite, you grant Super Mcp permission to access data from those services solely to perform the actions you request. We are not responsible for the content or privacy practices of these third-party services.</p>
        </section>

        <section>
          <h2>4. Prohibited Conduct</h2>
          <p>You agree not to use Super Mcp for any illegal purposes, to harass others, or to attempt to circumvent any security measures or usage limits of the underlying AI models.</p>
        </section>

        <section>
          <h2>5. Limitation of Liability</h2>
          <p>Super Mcp is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service or the AI-generated outputs.</p>
        </section>

        <footer>
          <Link href="/" className="btn btn-outline">Back to Home</Link>
        </footer>

        <style jsx>{`
          .policy-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 60px 20px;
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: var(--on-surface);
          }
          h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; color: var(--primary); }
          .last-updated { font-size: 14px; color: var(--outline); margin-bottom: 40px; }
          section { margin-bottom: 32px; }
          h2 { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
          footer { margin-top: 60px; padding-top: 24px; border-top: 1px solid var(--outline-variant); }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1>404 - Policy Not Found</h1>
      <Link href="/" style={{ marginTop: 20 }}>Return Home</Link>
    </div>
  );
}
