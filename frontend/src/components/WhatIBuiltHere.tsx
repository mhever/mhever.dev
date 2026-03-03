export default function WhatIBuiltHere() {
  return (
    <div className="wibu-card">
      <div className="wibu-header">What I Built Here</div>

      <a
        href="https://github.com/mhever/mhever.dev"
        target="_blank"
        rel="noopener"
        className="btn btn-ghost"
        style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}
      >
        ↗ View source on GitHub
      </a>

      <p className="wibu-intro">
        This site is two things at once: an <strong>interactive resume</strong> you can
        have a real conversation with, and a <strong>live technical case study</strong>.
        The AI chat runs on a production system built from scratch — the architecture
        below is what's running right now, not a past project.
      </p>

      <div className="wibu-block">
        <div className="wibu-subtitle">Architecture</div>
        <pre className="wibu-diagram">{`  React + Vite SPA
Azure Static Web Apps
          │
   Go HTTP Handler
   Azure Functions
  │    │     │      │
 KV  Blob  Table  Claude`}</pre>
      </div>

      <div className="wibu-block">
        <div className="wibu-subtitle">Monthly cost</div>
        <div className="wibu-cost-total">~$4/mo</div>
        <div className="wibu-cost-breakdown">
          <div className="wibu-cost-line">
            <span>Static Web Apps</span><span>free</span>
          </div>
          <div className="wibu-cost-line">
            <span>Azure Functions</span><span>~$0.40</span>
          </div>
          <div className="wibu-cost-line">
            <span>Key Vault + Storage</span><span>~$0.05</span>
          </div>
          <div className="wibu-cost-line">
            <span>Anthropic API (Haiku)</span><span>usage-based</span>
          </div>
        </div>
      </div>

      <div className="wibu-block">
        <div className="wibu-subtitle">Why each piece</div>

        <div className="wibu-tech-item">
          <span className="wibu-tech-name">Go</span>
          <span className="wibu-tech-reason">Fast cold starts, small binary, zero runtime deps.</span>
        </div>
        <div className="wibu-tech-item">
          <span className="wibu-tech-name">Azure Functions</span>
          <span className="wibu-tech-reason">Consumption tier scales to zero. Costs nothing when idle.</span>
        </div>
        <div className="wibu-tech-item">
          <span className="wibu-tech-name">Azure Static Web Apps</span>
          <span className="wibu-tech-reason">Free tier for SPAs. Global CDN and HTTPS with zero config.</span>
        </div>
        <div className="wibu-tech-item">
          <span className="wibu-tech-name">Terraform</span>
          <span className="wibu-tech-reason">Same IaC I use professionally. All infra is code, deployed via GitHub Actions.</span>
        </div>
        <div className="wibu-tech-item">
          <span className="wibu-tech-name">Table Storage</span>
          <span className="wibu-tech-reason">~$0.01/month for thousands of chat log rows. No database server.</span>
        </div>
        <div className="wibu-tech-item">
          <span className="wibu-tech-name">Claude Haiku</span>
          <span className="wibu-tech-reason">Cost-efficient for interactive chat. Sonnet-quality unnecessary at this scale.</span>
        </div>
      </div>

    </div>
  )
}
