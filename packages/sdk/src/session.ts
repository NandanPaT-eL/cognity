import { CognityConfig, Session } from './types'

const SESSION_KEY = 'cognity_session_id'

export async function createOrResumeSession(config: CognityConfig): Promise<Session> {
  const existingId = localStorage.getItem(SESSION_KEY)
  const apiUrl = config.apiUrl ?? 'https://api.cognity.ai'

  if (existingId) {
    try {
      const res = await fetch(`${apiUrl}/v1/sessions/${existingId}`, {
        headers: { Authorization: `Bearer ${config.apiKey}` }
      })
      if (res.ok) {
        const data = await res.json()
        return { session_id: data.session_id, opening_message: '', status: data.status }
      }
    } catch {}
  }

  // Create new session
  const endUserId = await getAnonymousId()
  const res = await fetch(`${apiUrl}/v1/sessions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ end_user_id: endUserId, page_path: window.location.pathname })
  })

  const session: Session = await res.json()
  localStorage.setItem(SESSION_KEY, session.session_id)
  return session
}

async function getAnonymousId(): Promise<string> {
  // SHA-256 hash of a random UUID — no PII stored
  const raw = crypto.randomUUID()
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}
