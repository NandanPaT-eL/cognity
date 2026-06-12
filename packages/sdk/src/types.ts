export interface CognityConfig {
  apiKey: string
  apiUrl?: string
}

export interface Session {
  session_id: string
  opening_message: string
  status: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}
