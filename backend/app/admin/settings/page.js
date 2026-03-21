export default function SettingsPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">System configuration and API keys</p>
        </div>
      </div>

      {/* API Configuration */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 4 }}>🔑 API Configuration</h3>
        <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 16 }}>Manage your API keys and service integrations</p>

        <div className="setting-row">
          <div>
            <div className="setting-label">NVIDIA API Key</div>
            <div className="setting-desc">Powers AI chat using Nemotron Ultra model</div>
          </div>
          <input className="env-input" type="password" defaultValue="nvapi-***" placeholder="nvapi-..." />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Supabase URL</div>
            <div className="setting-desc">Database and authentication</div>
          </div>
          <input className="env-input" defaultValue="https://wkffqed...supabase.co" readOnly />
        </div>
        <div className="setting-row" style={{ borderBottom: 'none' }}>
          <div>
            <div className="setting-label">AI Model</div>
            <div className="setting-desc">Default model for conversations</div>
          </div>
          <select className="env-input" style={{ width: 280 }}>
            <option>nvidia/llama-3.1-nemotron-ultra-253b-v1</option>
            <option>nvidia/llama-3.1-nemotron-70b-instruct</option>
            <option>meta/llama-3.1-405b-instruct</option>
          </select>
        </div>
      </div>

      {/* MCP Integrations */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 4 }}>🔗 MCP Integrations</h3>
        <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 16 }}>Connect external services via OAuth</p>

        <div className="setting-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎨</div>
            <div>
              <div className="setting-label">Figma</div>
              <div className="setting-desc">Import designs and assets • OAuth Login</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="env-input" style={{ width: 180 }} placeholder="Client ID" />
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>Connect</button>
          </div>
        </div>

        <div className="setting-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#7d2ae8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff' }}>C</div>
            <div>
              <div className="setting-label">Canva</div>
              <div className="setting-desc">Design templates and export • OAuth Login</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="env-input" style={{ width: 180 }} placeholder="Client ID" />
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>Connect</button>
          </div>
        </div>

        <div className="setting-row" style={{ borderBottom: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#4285f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff' }}>G</div>
            <div>
              <div className="setting-label">Google Drive</div>
              <div className="setting-desc">File storage integration</div>
            </div>
          </div>
          <span className="badge badge-outline">Coming Soon</span>
        </div>
      </div>

      {/* Rate Limits */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 4 }}>⚡ Rate Limits</h3>
        <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 16 }}>Configure per-plan API limits</p>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Messages / Day</th>
                <th>Tokens / Month</th>
                <th>Connected Apps</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge badge-outline">Free</span></td>
                <td>100</td>
                <td>500K</td>
                <td>2</td>
                <td>$0</td>
              </tr>
              <tr>
                <td><span className="badge badge-primary">Pro</span></td>
                <td>Unlimited</td>
                <td>5M</td>
                <td>Unlimited</td>
                <td>$12/mo</td>
              </tr>
              <tr>
                <td><span className="badge badge-warning">Enterprise</span></td>
                <td>Unlimited</td>
                <td>Unlimited</td>
                <td>Unlimited</td>
                <td>Custom</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
