import { CognityConfig, Session } from './types'

const SESSION_KEY = 'cognity_session_id'

export async function createOrResumeSession(config: CognityConfig): Promise<Session> {
  const apiUrl     = config.apiUrl ?? 'https://api.cognity.com.au'
  const existingId = localStorage.getItem(SESSION_KEY)

  if (existingId) {
    // Try fetching history from API; fall back to sessionStorage cache if unavailable
    try {
      const res = await fetch(
        `${apiUrl}/v1/sessions/${existingId}?include_messages=true`,
        { headers: { Authorization: `Bearer ${config.apiKey}` } }
      )
      if (res.ok) {
        const data = await res.json()
        const messages = data.messages ?? []
        // Cache locally so next page navigation restores instantly without a network call
        try { sessionStorage.setItem('cog_msg_cache', JSON.stringify(messages)) } catch {}
        return {
          session_id:      data.session_id,
          opening_message: '',
          status:          data.status,
          messages,
        }
      }
    } catch {}
    // Session fetch failed — restore from local cache so chat doesn't appear blank
    const cached = sessionStorage.getItem('cog_msg_cache')
    return {
      session_id:      existingId,
      opening_message: '',
      status:          'active',
      messages:        cached ? JSON.parse(cached) : [],
    }
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
