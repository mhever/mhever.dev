import { certifications } from '../content'

export default function Certifications() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {certifications.map((cert) => (
        <div key={cert.name} className="card" style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: '1 1 auto',
          minWidth: '240px',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}>
            {cert.date}
          </span>
          <span style={{ fontSize: '0.85rem' }}>
            {cert.name}
          </span>
        </div>
      ))}
    </div>
  )
}
