import { CognityConfig, Session } from './types'

const SESSION_KEY = 'cognity_session_id'

export async function createOrResumeSession(config: CognityConfig): Promise<Session> {
  const apiUrl     = config.apiUrl ?? 'https://api.cognity.com.au'
  const existingId = localStorage.getItem(SESSION_KEY)

  if (existingId) {
    // Fetch session + message history in one call so the widget can restore the chat
    try {
      const res = await fetch(
        `${apiUrl}/v1/sessions/${existingId}?include_messages=true`,
        { headers: { Authorization: `Bearer ${config.apiKey}` } }
      )
      if (res.ok) {
        const data = await res.json()
        return {
          session_id:      data.session_id,
          opening_message: '',
          status:          data.status,
          messages:        data.messages ?? [],
        }
      }
    } catch {}
    // Session fetch failed (network error) — keep using the stored ID optimistically
    return { session_id: existingId, opening_message: '', status: 'active', messages: [] }
  }

  // No session yet — create one
  const endUserId = await getAnonymousId()
  const res = await fetch(`${apiUrl}/v1/sessions`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ end_user_id: endUserId, page_path: window.location.pathname })
  })

  const session: Session = await res.json()
  localStorage.setItem(SESSION_KEY, session.session_id)
  return { ...session, messages: [] }
}

async function getAnonymousId(): Promise<string> {
  const raw = crypto.randomUUID()
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}
