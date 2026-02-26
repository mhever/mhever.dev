import { education, languages } from '../content'

export default function Education() {
  return (
    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Education
        </h3>
        {education.map((ed) => (
          <div key={ed.degree} style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '0.9rem' }}>{ed.degree}</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}>
              {ed.school} · {ed.year}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Languages
        </h3>
        {languages.map((lang) => (
          <div key={lang.language} style={{ marginBottom: '8px', display: 'flex', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', minWidth: '90px' }}>{lang.language}</span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}>
              {lang.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
