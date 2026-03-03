import { useState, useEffect } from 'react'
import Hero from './components/Hero'

import Experience from './components/Experience'
import Skills from './components/Skills'
import Testimonials from './components/Testimonials'
import Certifications from './components/Certifications'
import HomeLab from './components/HomeLab'
import Portfolio from './components/Portfolio'
import Education from './components/Education'
import AiChat from './components/AiChat'
import FitAssessment from './components/FitAssessment'
import Admin from './components/Admin'
import WhatIBuiltHere from './components/WhatIBuiltHere'

export default function App() {
  const [chatOpen, setChatOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

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
      <button
        onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 200,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all var(--transition)',
        }}
      >
        {theme === 'dark' ? '☀ light' : '☾ dark'}
      </button>
      <div className="page-layout">
        <main className="main-column">
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
            <Portfolio />
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
            <a href="https://github.com/mhever/mhever.dev" target="_blank" rel="noopener">
              View source
            </a>
            {(import.meta.env.VITE_COMMIT_SHA || import.meta.env.VITE_BUILD_DATE) && (
              <><br />{
                import.meta.env.VITE_BUILD_DATE
                  ? new Date(import.meta.env.VITE_BUILD_DATE).toISOString().slice(0, 10)
                  : ''
              }{import.meta.env.VITE_BUILD_DATE && import.meta.env.VITE_COMMIT_SHA ? ' · ' : ''}{
                import.meta.env.VITE_COMMIT_SHA
                  ? import.meta.env.VITE_COMMIT_SHA.slice(0, 7)
                  : ''
              }</>
            )}
          </footer>
        </main>

        <aside className="sidebar-column">
          <WhatIBuiltHere />
        </aside>
      </div>

      {chatOpen && <AiChat onClose={() => setChatOpen(false)} />}
    </>
  )
}
