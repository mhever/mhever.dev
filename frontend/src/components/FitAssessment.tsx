import { useState } from 'react'
import { parseMarkdown } from '../utils/parseMarkdown'

export default function FitAssessment() {
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [score, setScore] = useState<'strong' | 'moderate' | 'weak' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyze = async () => {
    if (!jobDescription.trim() || loading) return

    setLoading(true)
    setError(null)
    setResult(null)
    setScore(null)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jobDescription.trim() }),
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(body || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setResult(data.analysis)
      setScore(data.score)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p style={{ fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.6' }}>
        Paste a job description below. The AI will honestly assess whether my background
        is a good fit - and tell you if it isn't.
      </p>

      <textarea
        className="fit-textarea"
        placeholder="Paste a job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        disabled={loading}
      />

      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn btn-accent"
          onClick={analyze}
          disabled={loading || !jobDescription.trim()}
        >
          {loading ? 'Analyzing...' : 'Analyze Fit'}
        </button>
        {loading && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}>
            This takes a few seconds...
          </span>
        )}
      </div>

      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: 'rgba(212, 86, 86, 0.1)',
          border: '1px solid rgba(212, 86, 86, 0.3)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          color: 'var(--error)',
        }}>
          {error.includes('429') || error.includes('rate')
            ? 'Rate limit reached. Please try again in a few minutes.'
            : error.includes('503') || error.includes('unavailable')
            ? 'AI is temporarily unavailable. The monthly API budget may have been reached.'
            : error
          }
        </div>
      )}

      {result && score && (
        <div className="fit-result">
          <span className={`fit-score ${score}`}>
            {score === 'strong' ? '● Strong Fit' : score === 'moderate' ? '◐ Moderate Fit' : '○ Weak Fit'}
          </span>
          <div
            style={{
              fontSize: '0.9rem',
              lineHeight: '1.7',
              color: 'var(--text-secondary)',
            }}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(result) }}
          />
        </div>
      )}
    </div>
  )
}
