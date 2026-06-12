import { createOrResumeSession } from './session'
import { initTracker } from './tracker'
import { sendMessage } from './stream'
import { renderWidget } from './widget'

async function init() {
  const script = document.currentScript as HTMLScriptElement
  const apiKey = script?.dataset.key
  if (!apiKey) { console.error('[Cognity] Missing data-key attribute'); return }

  const config = { apiKey }

  try {
    const session = await createOrResumeSession(config)
    const widget = renderWidget(session.opening_message || 'Welcome! What are you trying to achieve today?', handleUserMessage)
    const tracker = initTracker(config, session.session_id)
    ;(window as Window & { cognity?: { activate: (goalEvent: string) => void } }).cognity = {
      activate: tracker.sendActivation
    }
    window.addEventListener('cognity:activate', ((event: Event) => {
      const customEvent = event as CustomEvent<{ goal_event?: string }>
      const goalEvent = customEvent.detail?.goal_event
      if (goalEvent) tracker.sendActivation(goalEvent)
    }) as EventListener)

    async function handleUserMessage(content: string) {
      widget.addMessage('assistant', '')
      await sendMessage(
        config,
        session.session_id,
        content,
        (chunk) => widget.appendToLast(chunk),
        (_id) => {}
      )
    }
  } catch (err) {
    console.error('[Cognity] Initialization error', err)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
