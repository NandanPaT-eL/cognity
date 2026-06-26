import { CognityConfig } from './types'

export async function sendMessage(
  config: CognityConfig,
  sessionId: string,
  content: string,
  onChunk: (text: string) => void,
  onDone: (messageId: string) => void
): Promise<{ limitReached: true; message?: string } | void> {
  const apiUrl = config.apiUrl ?? 'https://api.cognity.com.au'
  const res = await fetch(`${apiUrl}/v1/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  })

  if (res.status === 402) {
    const data = await res.json().catch(() => ({})) as { error?: string }
    return { limitReached: true, message: data.error ?? 'Monthly limit reached' }
  }

  if (!res.ok || !res.body) {
    throw new Error(`Cognity message request failed with status ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

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
        const json = JSON.parse(dataLine.replace('data: ', ''))
        if (json.delta) onChunk(json.delta)
        if (json.done) onDone(json.message_id)
      }

      eventBoundary = buffer.indexOf('\n\n')
    }
  }

  buffer += decoder.decode()
  if (buffer.trim()) {
    const dataLine = buffer.split('\n').find((line) => line.startsWith('data: '))
    if (dataLine) {
      const json = JSON.parse(dataLine.replace('data: ', ''))
      if (json.delta) onChunk(json.delta)
      if (json.done) onDone(json.message_id)
    }
  }
}
