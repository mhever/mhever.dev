import { useState } from 'react'
import Hero from './components/Hero'
import Experience from './components/Experience'
import Skills from './components/Skills'
import Testimonials from './components/Testimonials'
import Certifications from './components/Certifications'
import HomeLab from './components/HomeLab'
import Education from './components/Education'
import AiChat from './components/AiChat'
import FitAssessment from './components/FitAssessment'
import Admin from './components/Admin'

export default function App() {
  const [chatOpen, setChatOpen] = useState(false)

  // Simple hash routing for admin page
  const [page] = useState(() => window.location.hash)

  if (page === '#admin') {
    return (
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        <Admin />
      </div>
    )
  }

  return (
    <>
      <div className="container" style={{ paddingTop: '48px', paddingBottom: '80px' }}>
        <Hero onChatOpen={() => setChatOpen(true)} />

        <section className="section">
          <div className="section-label">Experience</div>
          <Experience />
        </section>

        <section className="section">
          <div className="section-label">Skills & Expertise</div>
          <Skills />
        </section>

        <section className="section">
          <div className="section-label">Testimonials</div>
          <Testimonials />
        </section>

        <section className="section">
          <div className="section-label">Certifications</div>
          <Certifications />
        </section>

        <section className="section">
          <div className="section-label">Projects</div>
          <HomeLab />
        </section>

        <section id="fit-assessment" className="section">
          <div className="section-label">Fit Assessment</div>
          <FitAssessment />
        </section>

        <section className="section">
          <div className="section-label">Education & Languages</div>
          <Education />
        </section>

        <footer style={{
          padding: '32px 0',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          letterSpacing: '0.05em',
        }}>
          Built with Go, React, Terraform, and deployed on Azure.{' '}
          <a href="https://github.com/martonhever/marton-hever.dev" target="_blank" rel="noopener">
            View source
          </a>
        </footer>
      </div>

      {chatOpen && <AiChat onClose={() => setChatOpen(false)} />}
    </>
  )
}
