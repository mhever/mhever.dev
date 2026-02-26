export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface FitResult {
  score: 'strong' | 'moderate' | 'weak'
  summary: string
  strengths: string[]
  gaps: string[]
  recommendation: string
}

export interface LogEntry {
  timestamp: string
  ip: string
  endpoint: string
  question: string
  response: string
  userAgent: string
}

export interface ExperienceItem {
  label: string
  title: string
  description: string
  context: string
  tags: string[]
}

export interface ExperienceRole {
  title: string
  company: string
  period: string
  items: ExperienceItem[]
}
