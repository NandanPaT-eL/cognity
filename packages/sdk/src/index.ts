import { createOrResumeSession } from './session'
import { initTracker } from './tracker'
import { sendMessage } from './stream'
import { renderWidget } from './widget'
import type { CognityConfig } from './types'

declare global {
  interface Window {
    __COGNITY_API_KEY__?: string
    cognity?: { activate: (goalEvent: string) => void }
  }
}

function resolveApiKey(): string | null {
  const script = document.currentScript as HTMLScriptElement | null
  if (script?.dataset.key) return script.dataset.key
  if (window.__COGNITY_API_KEY__) return window.__COGNITY_API_KEY__
  return null
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
    } catch {
      widget.addMessage('assistant', 'Sorry, something went wrong. Please try again.')
    }
  }
}

async function init() {
  const apiKey = resolveApiKey()
  if (!apiKey) {
    console.error('[Cognity] Missing API key — set COGNITY_API_KEY in .env and pass it via data-key or window.__COGNITY_API_KEY__')
    return
  }

  try {
    await boot({ apiKey })
  } catch (err) {
    console.error('[Cognity] Initialization error', err)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
