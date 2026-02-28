import { useState, useRef, useEffect } from 'react'
import { chatSuggestions } from '../content'
import type { ChatMessage } from '../types'
import { parseMarkdown } from '../utils/parseMarkdown'

interface AiChatProps {
  onClose: () => void
}

export default function AiChat({ onClose }: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: 'Ask me anything about Marton\'s experience, technical skills, or career background.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: ChatMessage = { role: 'user', content: text.trim() }
    const newMessages = [...messages.filter((m) => m.role !== 'system'), userMessage]
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(body || `HTTP ${res.status}`)
      }

      const data = await res.json()
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const showSuggestions = messages.filter((m) => m.role !== 'system').length === 0

  return (
    <div className="chat-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose()
    }}>
      <div className="chat-container">
        <div className="chat-header">
          <h3>
            <span style={{ color: 'var(--accent)', marginRight: '8px' }}>⟩</span>
            Ask about Marton's experience
          </h3>
          <button className="chat-close" onClick={onClose}>✕</button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              {msg.role === 'assistant'
                ? <span dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
                : msg.content}
            </div>
          ))}

          {loading && (
            <div className="chat-message assistant">
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          )}

          {error && (
            <div className="chat-message system" style={{ color: 'var(--error)' }}>
              {error.includes('429') || error.includes('rate')
                ? 'Rate limit reached. Please try again in a few minutes.'
                : error.includes('503') || error.includes('unavailable')
                ? 'AI is temporarily unavailable. The monthly API budget may have been reached.'
                : `Error: ${error}`
              }
            </div>
          )}

          {showSuggestions && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '8px',
            }}>
              {chatSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className="btn"
                  style={{ fontSize: '0.75rem', padding: '8px 12px' }}
                  onClick={() => sendMessage(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            ref={inputRef}
            className="chat-input"
            type="text"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
