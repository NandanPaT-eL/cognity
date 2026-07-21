import { CognityConfig } from './types'

type TourStep = {
  id: string
  selector: string
  fallback_selectors: string[]
  title: string
  body_text: string
  position: string
}

type SendMessageResult =
  | { limitReached: true; message?: string }
  | { tourOffer?: { id: string; name: string; steps: TourStep[] } }
  | { tourAction?: { id: string; steps: TourStep[] } }
  | void

export async function sendMessage(
  config: CognityConfig,
  sessionId: string,
  content: string,
  onChunk: (text: string) => void,
  onDone: (messageId: string) => void,
  skipTourMatch = false
): Promise<SendMessageResult> {
  const apiUrl = config.apiUrl ?? 'https://api.cognity.com.au'
  const res = await fetch(`${apiUrl}/v1/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, skip_tour_match: skipTourMatch || undefined })
  })

  if (res.status === 402) {
    const data = await res.json().catch(() => ({})) as { error?: string }
    return { limitReached: true, message: data.error ?? 'Monthly limit reached' }
  }

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '')
    throw new Error(
      `Cognity message request failed with status ${res.status}${errorBody ? `: ${errorBody}` : ''}`
    )
  }

  if (!res.body) {
    throw new Error(`Cognity message request failed with status ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let tourAction: { id: string; steps: TourStep[] } | undefined
  let tourOffer:  { id: string; name: string; steps: TourStep[] } | undefined

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let eventBoundary = buffer.indexOf('\n\n')
    while (eventBoundary !== -1) {
      const event = buffer.slice(0, eventBoundary)
      buffer = buffer.slice(eventBoundary + 2)

      const dataLine = event.split('\n').find((line) => line.startsWith('data: '))
      if (dataLine) {
        const raw = dataLine.slice(6)
        if (raw === '[DONE]') break

        const payload = JSON.parse(raw)
        if (payload.type === 'chunk') {
          onChunk(payload.text)
        } else if (payload.type === 'tour_offer') {
          tourOffer = { id: payload.tour.id, name: payload.tour_name, steps: payload.tour.steps }
        } else if (payload.type === 'tour_action') {
          tourAction = payload.tour
        } else if (payload.type === 'done') {
          onDone(payload.message_id)
        } else if (payload.type === 'error') {
          throw new Error(payload.message ?? 'Cognity stream failed')
        }
        // Legacy format support
        else if (payload.error) {
          throw new Error(payload.message ?? 'Cognity stream failed')
        } else if (payload.delta) {
          onChunk(payload.delta)
        } else if (payload.done) {
          onDone(payload.message_id)
        }
      }

      eventBoundary = buffer.indexOf('\n\n')
    }
  }

  buffer += decoder.decode()
  if (buffer.trim()) {
    const dataLine = buffer.split('\n').find((line) => line.startsWith('data: '))
    if (dataLine) {
      const raw = dataLine.slice(6)
      if (raw !== '[DONE]') {
        const payload = JSON.parse(raw)
        if (payload.type === 'chunk') {
          onChunk(payload.text)
        } else if (payload.type === 'tour_offer') {
          tourOffer = { id: payload.tour.id, name: payload.tour_name, steps: payload.tour.steps }
        } else if (payload.type === 'tour_action') {
          tourAction = payload.tour
        } else if (payload.type === 'done') {
          onDone(payload.message_id)
        } else if (payload.type === 'error') {
          throw new Error(payload.message ?? 'Cognity stream failed')
        }
        // Legacy format support
        else if (payload.error) {
          throw new Error(payload.message ?? 'Cognity stream failed')
        } else if (payload.delta) {
          onChunk(payload.delta)
        } else if (payload.done) {
          onDone(payload.message_id)
        }
      }
    }
  }

  if (tourOffer)  return { tourOffer }
  if (tourAction) return { tourAction }
}
