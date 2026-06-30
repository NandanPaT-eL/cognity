import { createOrResumeSession } from './session'
import { initTracker } from './tracker'
import { sendMessage } from './stream'
import { renderWidget } from './widget'
import type { CognityConfig } from './types'

declare global {
  interface Window {
    __COGNITY_API_KEY__?: string
    __COGNITY_API_URL__?: string
    cognity?: { activate: (goalEvent: string) => void }
  }
}

function resolveConfig(): CognityConfig | null {
  const script = document.currentScript as HTMLScriptElement | null
  let apiKey = script?.dataset.key || window.__COGNITY_API_KEY__
  let apiUrl = script?.dataset.apiUrl || window.__COGNITY_API_URL__

  if (!apiUrl && script?.src) {
    try {
      const url = new URL(script.src)
      apiUrl = `${url.protocol}//${url.host}`
    } catch {}
  }

  if (!apiKey) return null
  return { apiKey, apiUrl }
}

async function boot(config: CognityConfig) {
  const session = await createOrResumeSession(config)
  const widget = renderWidget(session.opening_message || 'Welcome! What are you trying to achieve today?', handleSend)
  const tracker = initTracker(config, session.session_id)
  window.cognity = { activate: tracker.sendActivation }
  window.addEventListener('cognity:activate', ((event: Event) => {
    const customEvent = event as CustomEvent<{ goal_event?: string }>
    const goalEvent = customEvent.detail?.goal_event
    if (goalEvent) tracker.sendActivation(goalEvent)
  }) as EventListener)

  async function handleSend(userText: string) {
    let assistantBubbleAdded = false

    const onChunk = (chunk: string) => {
      if (!assistantBubbleAdded) {
        widget.addMessage('assistant', '')
        assistantBubbleAdded = true
      }
      widget.appendToLast(chunk)
    }

    try {
      const result = await sendMessage(
        config,
        session.session_id,
        userText,
        onChunk,
        (_messageId) => {}
      )
      if (result?.limitReached) {
        widget.addMessage(
          'assistant',
          "You've reached your monthly limit. Please ask your team to upgrade at cognity.com.au"
        )
      }
    } catch (error) {
      widget.addMessage(
        'assistant',
        error instanceof Error ? error.message : 'Sorry, something went wrong. Please try again.'
      )
    }
  }
}

async function init() {
  const config = resolveConfig()
  if (!config) {
    console.error('[Cognity] Missing API key — set COGNITY_API_KEY in .env and pass it via data-key or window.__COGNITY_API_KEY__')
    return
  }

  try {
    await boot(config)
  } catch (err) {
    console.error('[Cognity] Initialization error', err)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
