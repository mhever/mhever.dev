export default function Testimonials() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{
        fontSize: '0.9rem',
        lineHeight: '1.7',
        color: 'var(--text-secondary)',
      }}>
        Former colleagues from the Swiss Re platform team - architects, engineering directors,
        and VPs - have shared their experience working with Marton on LinkedIn.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <a
          href="https://www.linkedin.com/in/marton-hever/details/recommendations/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--accent)',
          }}
        >
          → LinkedIn Recommendations
        </a>
        <a
          href="https://www.linkedin.com/feed/update/urn:li:activity:7426725431212515329/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--accent)',
          }}
        >
          → Farewell post &amp; colleague comments
        </a>
      </div>
    </div>
  )
}