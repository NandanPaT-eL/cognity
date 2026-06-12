import { CognityConfig } from './types'

const IDLE_THRESHOLD_MS = 45_000

export function initTracker(config: CognityConfig, sessionId: string) {
  const apiUrl = config.apiUrl ?? 'https://api.cognity.ai'
  let idleTimer: ReturnType<typeof setTimeout>
  let idleStart: number

  const sendEvent = (payload: Record<string, unknown>) => {
    fetch(`${apiUrl}/v1/sessions/${sessionId}/events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(async res => {
      const data = await res.json()
      if (data.nudge) window.dispatchEvent(new CustomEvent('cognity:nudge', { detail: data.nudge }))
    }).catch(() => {})
  }

  const resetIdle = () => {
    clearTimeout(idleTimer)
    idleStart = Date.now()
    idleTimer = setTimeout(() => {
      sendEvent({ event_type: 'idle', page_path: window.location.pathname, idle_seconds: 45 })
    }, IDLE_THRESHOLD_MS)
  }

  // Track page views on SPA navigation
  const trackPageView = () => {
    sendEvent({ event_type: 'page_view', page_path: window.location.pathname })
    resetIdle()
  }

  const patchHistoryMethod = (method: 'pushState' | 'replaceState') => {
    const historyObject = history as History & Record<'pushState' | 'replaceState', (...args: unknown[]) => unknown>
    const original = historyObject[method]
    historyObject[method] = function (...args: unknown[]) {
      const result = original.apply(this, args)
      window.dispatchEvent(new Event('cognity:routechange'))
      return result
    }
  }

  document.addEventListener('mousemove', resetIdle)
  document.addEventListener('keydown', resetIdle)
  document.addEventListener('click', resetIdle)
  window.addEventListener('popstate', trackPageView)
  window.addEventListener('cognity:routechange', trackPageView)
  patchHistoryMethod('pushState')
  patchHistoryMethod('replaceState')

  // Initial page view
  trackPageView()

  return {
    sendActivation: (goalEvent: string) => {
      sendEvent({ event_type: 'activation', page_path: window.location.pathname, metadata: { goal_event: goalEvent } })
    }
  }
}
