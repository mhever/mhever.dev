import { useState } from 'react'
import { portfolio } from '../content'

export default function Portfolio() {
  const [open, setOpen] = useState(false)

  return (
    <div className="card">
      <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="tag">{portfolio.label}</span>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{portfolio.title}</h3>
      </div>

      <p style={{ fontSize: '0.875rem', lineHeight: '1.65', marginBottom: '10px' }}>
        {portfolio.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
        {portfolio.tags.map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>

      <button className="context-trigger" onClick={() => setOpen(!open)}>
        <span className={`arrow ${open ? 'open' : ''}`}>▶</span>
        {open ? 'Hide full story' : 'View full story'}
      </button>

      <div className={`expandable ${open ? 'expanded' : 'collapsed'}`}>
        <div className="context-content">
          {portfolio.context}
        </div>
      </div>
    </div>
  )
}
