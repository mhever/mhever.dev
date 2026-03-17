import { useState } from 'react'

type ProjectCardContent = {
  label: string
  title: string
  description: string
  tags: string[]
  context: string
}

export default function ProjectCard({ content }: { content: ProjectCardContent }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card">
      <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="tag">{content.label}</span>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{content.title}</h3>
      </div>

      <p style={{ fontSize: '0.875rem', lineHeight: '1.65', marginBottom: '10px' }}>
        {content.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
        {content.tags.map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>

      <button className="context-trigger" onClick={() => setOpen(!open)}>
        <span className={`arrow ${open ? 'open' : ''}`}>▶</span>
        {open ? 'Hide full story' : 'View full story'}
      </button>

      <div className={`expandable ${open ? 'expanded' : 'collapsed'}`}>
        <div className="context-content">
          {content.context}
        </div>
      </div>
    </div>
  )
}
