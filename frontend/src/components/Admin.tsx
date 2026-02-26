import { useState } from 'react'
import type { LogEntry } from '../types'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const login = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/logs', {
        headers: { 'Authorization': `Bearer ${password}` },
      })
      if (res.status === 401) {
        setError('Invalid password')
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setLogs(data.logs || [])
      setAuthenticated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/logs', {
        headers: { 'Authorization': `Bearer ${password}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed')
    } finally {
      setLoading(false)
    }
  }

  if (!authenticated) {
    return (
      <div className="admin-login">
        <h2 style={{ marginBottom: '24px' }}>Admin</h2>
        <input
          className="admin-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
        />
        <button className="btn btn-accent" onClick={login} disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Checking...' : 'Login'}
        </button>
        {error && (
          <div style={{ marginTop: '12px', color: 'var(--error)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h2>Usage Logs</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}>
            {logs.length} entries
          </span>
          <button className="btn" onClick={refresh} disabled={loading}>
            {loading ? '...' : 'Refresh'}
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No logs yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="log-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>IP</th>
                <th>Type</th>
                <th>Question</th>
                <th>Response</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {log.ip}
                  </td>
                  <td>
                    <span className="tag">
                      {log.endpoint.includes('fit') ? 'fit' : 'chat'}
                    </span>
                  </td>
                  <td className="log-expand" style={{ maxWidth: '250px' }}>
                    {expandedRow === i ? log.question : truncate(log.question, 80)}
                  </td>
                  <td className="log-expand" style={{ maxWidth: '350px' }}>
                    {expandedRow === i ? log.response : truncate(log.response, 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '...' : s
}
