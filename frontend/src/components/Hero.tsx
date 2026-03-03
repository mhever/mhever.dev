import { profile, technologies } from '../content'

interface HeroProps {
  onChatOpen: () => void
}

export default function Hero({ onChatOpen }: HeroProps) {
  return (
    <section style={{ paddingBottom: '48px' }}>
      {/* Name + Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '6px' }}>{profile.name}</h1>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.9rem',
          color: 'var(--accent)',
          marginBottom: '12px',
        }}>
          {profile.title}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <span>{profile.location}</span>
          <span>·</span>
          <span>{profile.availability}</span>
          <span>·</span>
          <span>{profile.status}</span>
        </div>
      </div>

      {/* Summary */}
      <p style={{ fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '24px' }}>
        {profile.summary}
      </p>

      {/* Technologies */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '28px' }}>
        {technologies.primary.map((t) => (
          <span key={t} className="tag tag-accent">{t}</span>
        ))}
        {technologies.secondary.map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
        {technologies.observability.map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button className="btn btn-accent" onClick={onChatOpen}>
          <span style={{ fontSize: '1rem' }}>⟩</span>
          Ask AI about my experience
        </button>
        <a className="btn btn-accent" href="#fit-assessment">
          <span style={{ fontSize: '1rem' }}>⟩</span>
          Analyze Fit with AI
        </a>
        <a className="btn" href={profile.linkedin} target="_blank" rel="noopener">
          LinkedIn
        </a>
        <a className="btn" href={`mailto:${profile.email}`}>
          Email
        </a>
        <a className="btn" href={profile.github} target="_blank" rel="noopener">
          GitHub source
        </a>
      </div>
    </section>
  )
}
