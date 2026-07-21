import type { CognityConfig, ElementFingerprint } from './types'

// ─── Fingerprint generation ───────────────────────────────────────────────────

function getFingerprint(el: Element): ElementFingerprint {
  // Build DOM path: array of sibling indices walking up to body
  const path: number[] = []
  let node: Element    = el
  while (node.parentElement && node.parentElement !== document.body) {
    const parent = node.parentElement
    const index  = Array.from(parent.children).indexOf(node)
    path.unshift(index)
    node = parent
  }
  // Add final index under body
  if (node.parentElement === document.body) {
    path.unshift(Array.from(document.body.children).indexOf(node))
  }

  const text = (el.textContent ?? '').trim().slice(0, 60)
  const rect  = el.getBoundingClientRect()

  const wBands = [80, 200, 400, 700]
  const wIdx   = wBands.findIndex(b => rect.width < b)
  const widthBand = (['xs', 'sm', 'md', 'lg', 'xl'] as const)[wIdx === -1 ? 4 : wIdx]

  const hBands = [24, 48, 80]
  const hIdx   = hBands.findIndex(b => rect.height < b)
  const heightBand = (['xs', 'sm', 'md', 'lg'] as const)[hIdx === -1 ? 3 : hIdx]

  return {
    domPath:   path,
    tag:       el.tagName.toLowerCase(),
    text,
    parentTag: el.parentElement?.tagName.toLowerCase() ?? 'body',
    rect: { widthBand, heightBand },
  }
}

// ─── Picker ───────────────────────────────────────────────────────────────────

export function initPicker(tourId: string, config: CognityConfig) {
  const apiBase = config.apiUrl ?? 'https://api.cognity.com.au'

  // Persist tourId so picker re-activates on subsequent page loads
  sessionStorage.setItem('cognity_edit_tour', tourId)

  // ── Banner ──────────────────────────────────────────────────────────────
  const banner        = document.createElement('div')
  banner.id           = 'cog-picker-banner'
  banner.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; z-index: 999999;
    background: #7C3AED; color: #fff; font-family: system-ui, sans-serif;
    font-size: 13px; font-weight: 600; padding: 10px 20px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 2px 12px rgba(124,58,237,0.4);
  `
  banner.innerHTML = `
    <span>🎯 <strong>Cognity Tour Editor</strong></span>
    <span style="color:rgba(255,255,255,0.5);font-weight:400">— click any element to add a step</span>
    <div style="flex:1"></div>
    <button id="cog-picker-toggle" style="
      background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.35);
      color:#fff;border-radius:6px;padding:4px 14px;font-size:12px;
      font-weight:600;cursor:pointer;font-family:inherit;
    ">⏸ Pause selector</button>
    <button id="cog-picker-done" style="
      background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.35);
      color: #fff; border-radius: 6px; padding: 4px 14px; font-size: 12px;
      font-weight: 600; cursor: pointer; font-family: inherit;
    ">Done editing</button>
  `
  document.body.appendChild(banner)

  // ── Hover overlay ───────────────────────────────────────────────────────
  const overlay        = document.createElement('div')
  overlay.id           = 'cog-picker-overlay'
  overlay.style.cssText = `
    position: fixed; pointer-events: none; z-index: 999998;
    border: 2px solid #7C3AED; border-radius: 4px;
    background: rgba(124,58,237,0.08);
    transition: all 0.08s ease; box-sizing: border-box;
  `
  document.body.appendChild(overlay)

  // ── State ────────────────────────────────────────────────────────────────
  let currentPopup: HTMLElement | null = null
  let hoveredEl:    Element | null     = null
  let isPaused      = false   // true while popup is open — freezes hover overlay

  // ── Freeze / unfreeze helpers ────────────────────────────────────────────
  function freezeOverlay() {
    isPaused = true
    overlay.style.border = '2px solid #10b981'  // green = locked
  }

  function unfreezeOverlay() {
    isPaused  = false
    hoveredEl = null
    overlay.style.border     = '2px solid #7C3AED'
    overlay.style.width      = '0'
    overlay.style.height     = '0'
  }

  // ── Hover tracking ───────────────────────────────────────────────────────
  function onMouseOver(e: MouseEvent) {
    if (isPaused || !selectorActive) return  // frozen while popup open, or selector paused

    const target = e.target as Element
    if (
      target.closest('#cog-picker-banner') ||
      target.closest('#cog-picker-overlay') ||
      target.closest('#cog-picker-popup')
    ) return

    hoveredEl = target
    const rect = target.getBoundingClientRect()
    overlay.style.top    = `${rect.top    - 2}px`
    overlay.style.left   = `${rect.left   - 2}px`
    overlay.style.width  = `${rect.width  + 4}px`
    overlay.style.height = `${rect.height + 4}px`
  }

  document.addEventListener('mouseover', onMouseOver, true)

  // ── Click capture ────────────────────────────────────────────────────────
  function onClickCapture(e: MouseEvent) {
    // Always use e.target for the membership check — hoveredEl is frozen
    const clickedEl = e.target as Element

    // Pass through all clicks inside our own UI
    if (
      clickedEl.closest('#cog-picker-banner') ||
      clickedEl.closest('#cog-picker-popup')
    ) return

    // When selector is paused, don't intercept anything
    if (!selectorActive) return

    // If popup is open, any outside click closes it and re-enables picking
    if (isPaused && currentPopup) {
      e.preventDefault()
      e.stopPropagation()
      currentPopup.remove()
      currentPopup = null
      unfreezeOverlay()
      return
    }

    // Nothing hovered yet (shouldn't happen, but guard)
    if (!hoveredEl) return

    e.preventDefault()
    e.stopPropagation()

    const target                     = hoveredEl
    const fingerprint                = getFingerprint(target)
    const fingerprintJson            = JSON.stringify(fingerprint)
    const rect                       = target.getBoundingClientRect()

    // Freeze overlay while popup is open
    freezeOverlay()

    // Remove any leftover popup
    currentPopup?.remove()

    // ── Inline popup ────────────────────────────────────────────────────
    const popup        = document.createElement('div')
    popup.id           = 'cog-picker-popup'
    popup.style.cssText = `
      position: fixed; z-index: 9999999;
      top: ${Math.min(rect.bottom + 10, window.innerHeight - 280)}px;
      left: ${Math.min(rect.left, window.innerWidth - 320)}px;
      width: 300px; background: #1a1a2e; color: #fff;
      border-radius: 10px; padding: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.4);
      font-family: system-ui, sans-serif;
    `
    popup.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5)">
          Page: <code style="color:#a78bfa">${window.location.pathname}</code>
        </p>
        <button id="cog-step-deselect" title="Deselect element" style="
          background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);
          color:rgba(255,255,255,0.6);border-radius:5px;padding:2px 8px;font-size:11px;
          cursor:pointer;font-family:inherit;white-space:nowrap;
        ">✕ Deselect</button>
      </div>
      <p style="margin:0 0 10px;font-size:11px;color:rgba(255,255,255,0.35);word-break:break-all">
        Element: <code style="color:#a78bfa">${fingerprint.tag}${fingerprint.text ? ` "${fingerprint.text.slice(0, 20)}"` : ''}</code>
      </p>
      <div style="margin-bottom:10px">
        <label style="display:block;font-size:11px;font-weight:600;color:rgba(255,255,255,0.6);margin-bottom:4px">
          STEP TITLE
        </label>
        <input id="cog-step-title" type="text" placeholder="e.g. Welcome to the dashboard"
          style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.08);
          border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:7px 10px;
          font-size:13px;color:#fff;font-family:inherit;outline:none;" />
      </div>
      <div style="margin-bottom:12px">
        <label style="display:block;font-size:11px;font-weight:600;color:rgba(255,255,255,0.6);margin-bottom:4px">
          STEP DESCRIPTION
        </label>
        <textarea id="cog-step-body" placeholder="Describe what the user should do here…" rows="3"
          style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.08);
          border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:7px 10px;
          font-size:13px;color:#fff;font-family:inherit;outline:none;resize:vertical;"></textarea>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button id="cog-step-save" style="flex:1;background:#7C3AED;color:#fff;border:none;
          border-radius:6px;padding:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">
          Save step
        </button>
      </div>
      <div id="cog-step-status" style="margin-top:8px;font-size:12px;text-align:center"></div>
    `
    document.body.appendChild(popup)
    currentPopup = popup

    // Focus title input — use timeout so the click event fully resolves first
    setTimeout(() => {
      (popup.querySelector('#cog-step-title') as HTMLInputElement)?.focus()
    }, 50)

    // Deselect — close popup and re-enable picking without saving
    popup.querySelector('#cog-step-deselect')!.addEventListener('click', (ev) => {
      ev.stopPropagation()
      popup.remove()
      currentPopup = null
      unfreezeOverlay()
    })

    popup.querySelector('#cog-step-save')!.addEventListener('click', async () => {
      const title    = (popup.querySelector('#cog-step-title')  as HTMLInputElement).value.trim()
      const bodyText = (popup.querySelector('#cog-step-body')   as HTMLTextAreaElement).value.trim()
      const statusEl =  popup.querySelector('#cog-step-status') as HTMLElement
      const saveBtn  =  popup.querySelector('#cog-step-save')   as HTMLButtonElement

      if (!title || !bodyText) {
        statusEl.style.color = '#f87171'
        statusEl.textContent  = 'Both title and description are required.'
        return
      }

      saveBtn.disabled    = true
      saveBtn.textContent = 'Saving…'

      try {
        const res = await fetch(`${apiBase}/v1/tours/${tourId}/steps`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            fingerprint:  fingerprintJson,
            title,
            body_text:    bodyText,
            position:     'bottom',
            page_url:     window.location.pathname,
          }),
        })

        if (!res.ok) throw new Error(`API error ${res.status}`)

        showToast('✓ Step added!')
        popup.remove()
        currentPopup = null
        unfreezeOverlay()
      } catch (err) {
        statusEl.style.color = '#f87171'
        statusEl.textContent  = 'Failed to save step. Check console.'
        console.error('[Cognity Picker]', err)
        saveBtn.disabled    = false
        saveBtn.textContent = 'Save step'
      }
    })
  }

  document.addEventListener('click', onClickCapture, true)

  // ── Pause / Resume toggle ────────────────────────────────────────────────
  let selectorActive = true

  function updateToggleBtn() {
    const btn = document.getElementById('cog-picker-toggle') as HTMLButtonElement
    if (!btn) return
    if (selectorActive) {
      btn.textContent          = '⏸ Pause selector'
      btn.style.background     = 'rgba(255,255,255,0.2)'
      overlay.style.display    = ''
    } else {
      btn.textContent          = '▶ Resume selector'
      btn.style.background     = 'rgba(16,185,129,0.35)'  // green tint = paused
      overlay.style.display    = 'none'
    }
  }

  document.getElementById('cog-picker-toggle')?.addEventListener('click', (e) => {
    e.stopPropagation()
    selectorActive = !selectorActive
    if (!selectorActive) {
      // Close any open popup and unfreeze so state is clean on resume
      currentPopup?.remove()
      currentPopup = null
      unfreezeOverlay()
    }
    updateToggleBtn()
  })

  // ── Toast helper ─────────────────────────────────────────────────────────
  function showToast(msg: string) {
    const toast        = document.createElement('div')
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9999999;
      background: #7C3AED; color: #fff; padding: 10px 18px;
      border-radius: 8px; font-size: 13px; font-weight: 600;
      font-family: system-ui, sans-serif;
      box-shadow: 0 4px 16px rgba(124,58,237,0.5);
    `
    toast.textContent = msg
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 2500)
  }

  // ── Done editing ─────────────────────────────────────────────────────────
  function cleanup() {
    document.removeEventListener('mouseover', onMouseOver, true)
    document.removeEventListener('click', onClickCapture, true)
    banner.remove()
    overlay.remove()
    currentPopup?.remove()

    sessionStorage.removeItem('cognity_edit_tour')

    const url = new URL(window.location.href)
    url.searchParams.delete('cognity_edit')
    window.history.replaceState({}, '', url.toString())
  }

  document.getElementById('cog-picker-done')?.addEventListener('click', cleanup)
}
