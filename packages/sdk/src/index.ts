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
  const widget  = renderWidget(
    session.opening_message || 'Welcome! What are you trying to achieve today?',
    handleSend,
    session.messages ?? []
  )
  const tracker = initTracker(config, session.session_id)
  window.cognity = { activate: tracker.sendActivation }
  window.addEventListener('cognity:activate', ((event: Event) => {
    const customEvent = event as CustomEvent<{ goal_event?: string }>
    const goalEvent = customEvent.detail?.goal_event
    if (goalEvent) tracker.sendActivation(goalEvent)
  }) as EventListener)

  async function handleSend(userText: string, skipTourMatch = false) {
    let assistantBubbleAdded = false

    // Show typing indicator immediately
    widget.showTyping()

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
        (_messageId) => {},
        skipTourMatch
      )

      if (result && 'limitReached' in result && result.limitReached) {
        widget.addMessage(
          'assistant',
          "You've reached your monthly limit. Please ask your team to upgrade at cognity.com.au"
        )
      } else if (result && 'tourOffer' in result && result.tourOffer) {
        const offer = result.tourOffer
        // Show Yes / No buttons below the offer message
        widget.showTourOffer(
          // "Start tour" — launch it
          async () => {
            const { playTourSteps } = await import('./tour')
            playTourSteps(offer.steps, offer.id)
          },
          // "Answer me" — re-send with skip_tour_match so AI answers normally
          () => handleSend(userText, true)
        )
      } else if (result && 'tourAction' in result && result.tourAction) {
        const { playTourSteps } = await import('./tour')
        playTourSteps(result.tourAction.steps, result.tourAction.id)
      }
    } catch (error) {
      widget.hideTyping()
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

  // ── Tour picker mode: ?cognity_edit=<TOUR_ID> or sessionStorage ───────
  const urlParams    = new URLSearchParams(window.location.search)
  const editTourId   = urlParams.get('cognity_edit')
                    || sessionStorage.getItem('cognity_edit_tour')

  if (editTourId) {
    try {
      const { initPicker } = await import('./picker')
      initPicker(editTourId, config)
    } catch (err) {
      console.error('[Cognity] Picker initialization error', err)
    }
    // Don't boot the normal chat widget in edit mode, but don't return early
    // for sessionStorage case — initPicker handles the rest
    return
  }

  // ── Tour playback — page_load tours only ─────────────────────────────
  // Manual tours are triggered exclusively by the AI via playTourSteps().
  // checkAndPlayTour only fetches tours with trigger_type = 'page_load',
  // OR resumes a cross-page tour already in progress (cog_tour_step_index).
  import('./tour').then(({ checkAndPlayTour }) => {
    checkAndPlayTour(config)
  }).catch(() => {})

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
