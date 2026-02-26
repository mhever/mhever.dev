import { useState } from 'react'
import { experience } from '../content'
import type { ExperienceItem } from '../types'

function ContextBlock({ item }: { item: ExperienceItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card" style={{ marginBottom: '12px' }}>
      <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="tag tag-accent" style={{ flexShrink: 0 }}>{item.label}</span>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.title}</h3>
      </div>

      <p style={{ fontSize: '0.875rem', lineHeight: '1.65', marginBottom: '10px' }}>
        {item.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
        {item.tags.map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>

      <button className="context-trigger" onClick={() => setOpen(!open)}>
        <span className={`arrow ${open ? 'open' : ''}`}>▶</span>
        {open ? 'Hide full story' : 'View full story'}
      </button>

      <div className={`expandable ${open ? 'expanded' : 'collapsed'}`}>
        <div className="context-content">
          {item.context}
        </div>
      </div>
    </div>
  )
}

export default function Experience() {
  return (
    <div>
      {experience.map((role) => (
        <div key={role.company} style={{ marginBottom: '36px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ marginBottom: '4px' }}>{role.title}</h2>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'flex',
              gap: '12px',
            }}>
              <span>{role.company}</span>
              <span>·</span>
              <span>{role.period}</span>
            </div>
          </div>

          {role.items.map((item) => (
            <ContextBlock key={item.label} item={item} />
          ))}
        </div>
      ))}
    </div>
  )
}
