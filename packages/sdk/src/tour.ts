import type { CognityConfig, ElementFingerprint } from './types'

type TourStep = {
  id:          string
  fingerprint: string       // JSON string of ElementFingerprint
  title:       string
  body_text:   string
  position:    string
  page_url:    string | null
}

// ─── Module-level rAF handle ──────────────────────────────────────────────────
let _spotlightRafId: number | null = null

export async function checkAndPlayTour(config: CognityConfig) {
  const apiBase  = config.apiUrl ?? 'https://api.cognity.com.au'
  const pagePath = window.location.pathname

  try {
    const savedIndex  = parseInt(sessionStorage.getItem('cog_tour_step_index') ?? '0', 10)
    const savedSteps  = sessionStorage.getItem('cog_tour_steps')
    const savedTourId = sessionStorage.getItem('cog_tour_id') ?? ''
    const inProgress  = savedIndex > 0 && !!savedSteps  // tourId may be empty for AI-triggered tours

    // Mid-tour cross-page: resume directly from sessionStorage.
    // No API call needed — page_path filter would reject us anyway since
    // the tour's page_url points to the starting page, not this page.
    if (inProgress) {
      const steps = JSON.parse(savedSteps!) as TourStep[]
      playTour(steps, savedIndex, savedTourId || undefined)  // empty string → undefined
      return
    }

    // Fresh visit — fetch a matching page_load tour for this exact page
    const res = await fetch(
      `${apiBase}/v1/tours/active?page_path=${encodeURIComponent(pagePath)}`,
      { headers: { 'Authorization': `Bearer ${config.apiKey}` } }
    )
    if (!res.ok) return
    const tour = await res.json()
    if (!tour || !tour.steps?.length) return

    // Skip if already seen
    if (localStorage.getItem(`cog_tour_seen_${tour.id}`)) return

    playTour(tour.steps as TourStep[], 0, tour.id)
  } catch {
    // Non-fatal: tour playback failure should never break the host page
  }
}

function findByFingerprint(fp: ElementFingerprint): Element | null {
  // Strategy 1: walk the exact DOM path
  try {
    let node: Element = document.body
    for (const idx of fp.domPath) {
      const child = node.children[idx]
      if (!child) throw new Error('path miss')
      node = child
    }
    if (node.tagName.toLowerCase() === fp.tag) return node
  } catch {}

  // Strategy 2: scan all matching tags, score by text + parent + size band
  const candidates = Array.from(document.querySelectorAll(fp.tag))
  const scored = candidates.map(el => {
    let score = 0
    const elText = (el.textContent ?? '').trim().slice(0, 60)

    if (fp.text && elText === fp.text)            score += 10
    else if (fp.text && elText.includes(fp.text)) score += 5
    else if (fp.text && fp.text.includes(elText)) score += 3

    if (el.parentElement?.tagName.toLowerCase() === fp.parentTag) score += 2

    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) {
      const wBands = [80, 200, 400, 700]
      const wIdx   = wBands.findIndex(b => r.width < b)
      const wBand  = (['xs', 'sm', 'md', 'lg', 'xl'] as const)[wIdx === -1 ? 4 : wIdx]
      const hBands = [24, 48, 80]
      const hIdx   = hBands.findIndex(b => r.height < b)
      const hBand  = (['xs', 'sm', 'md', 'lg'] as const)[hIdx === -1 ? 3 : hIdx]
      if (wBand === fp.rect.widthBand)  score += 1
      if (hBand === fp.rect.heightBand) score += 1
    }

    return { el, score }
  })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored[0]?.el ?? null
}

// ─── Scroll + spotlight with IntersectionObserver timing ─────────────────────

function scrollThenSpotlight(
  el: HTMLElement,
  step: TourStep,
  index: number,
  total: number,
  onNext: () => void
) {
  const rect   = el.getBoundingClientRect()
  const inView = rect.top >= 0 && rect.bottom <= window.innerHeight

  if (inView) {
    showSpotlight(el, step, index, total, onNext)
    return
  }

  el.scrollIntoView({ behavior: 'smooth', block: 'center' })

  let settled = false

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !settled) {
        settled = true
        observer.disconnect()
        // Small delay for scroll animation to fully complete
        setTimeout(() => showSpotlight(el, step, index, total, onNext), 150)
      }
    },
    { threshold: 0.5 }
  )

  observer.observe(el)

  // Fallback: if observer never fires (shadow DOM, zero-size element, etc.)
  setTimeout(() => {
    if (!settled) {
      settled = true
      observer.disconnect()
      showSpotlight(el, step, index, total, onNext)
    }
  }, 800)
}

// ─── Multi-page tour orchestration ───────────────────────────────────────────

function playTour(steps: TourStep[], startIndex = 0, tourId?: string) {
  const currentPath = window.location.pathname
  let currentIndex  = startIndex

  function renderStep() {
    if (currentIndex >= steps.length) {
      // Tour complete — mark as seen so it never auto-plays again
      if (tourId) localStorage.setItem(`cog_tour_seen_${tourId}`, '1')
      sessionStorage.removeItem('cog_tour_step_index')
      sessionStorage.removeItem('cog_tour_steps')
      sessionStorage.removeItem('cog_tour_id')
      cleanupSpotlight()
      return
    }

    const step     = steps[currentIndex]
    const stepPage = step.page_url ?? currentPath

    // If this step belongs to a different page, navigate there.
    // Persist the full steps array so the next page can resume without an API call.
    if (stepPage !== currentPath) {
      sessionStorage.setItem('cog_tour_step_index', String(currentIndex))
      sessionStorage.setItem('cog_tour_steps',      JSON.stringify(steps))
      sessionStorage.setItem('cog_tour_id',         tourId ?? '')
      cleanupSpotlight()
      window.location.href = stepPage
      return
    }

    // Step is on this page — find and spotlight the element
    const fp = JSON.parse(step.fingerprint) as ElementFingerprint
    const el = findByFingerprint(fp)
    if (!el) {
      // Element not found on this page — skip
      currentIndex++
      renderStep()
      return
    }

    scrollThenSpotlight(el as HTMLElement, step, currentIndex, steps.length, () => {
      currentIndex++
      sessionStorage.setItem('cog_tour_step_index', String(currentIndex))
      // Keep steps in sessionStorage so cross-page navigation always has them
      sessionStorage.setItem('cog_tour_steps', JSON.stringify(steps))
      renderStep()
    })
  }

  renderStep()
}

function showSpotlight(
  el: HTMLElement,
  step: TourStep,
  index: number,
  total: number,
  onNext: () => void
) {
  cleanupSpotlight()
  const pad = 8

  // Spotlight box — position set by rAF loop, not hardcoded
  const box        = document.createElement('div')
  box.id           = 'cog-tour-box'
  box.style.cssText = `
    position:fixed;z-index:999991;border-radius:8px;
    box-shadow:0 0 0 9999px rgba(0,0,0,0.55),0 0 0 3px #7C3AED;
    pointer-events:none;transition:box-shadow 0.3s ease;
    width:0;height:0;top:0;left:0;
  `
  document.body.appendChild(box)

  // Tooltip — position set by rAF loop
  const tip        = document.createElement('div')
  tip.id           = 'cog-tour-tooltip'
  tip.style.cssText = `
    position:fixed;z-index:999992;background:white;color:#1a1a2e;
    padding:16px;border-radius:10px;max-width:280px;
    box-shadow:0 8px 24px rgba(0,0,0,0.2);font-family:system-ui,sans-serif;
  `
  tip.innerHTML = `
    <p style="margin:0 0 4px;font-weight:700;font-size:14px">${step.title}</p>
    <p style="margin:0 0 12px;font-size:13px;color:#555;line-height:1.5">${step.body_text}</p>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:11px;color:#999">${index + 1} of ${total}</span>
      <button id="cog-tour-next"
        style="background:#7C3AED;color:white;border:none;border-radius:6px;
        padding:6px 16px;font-size:13px;font-weight:600;cursor:pointer">
        ${index + 1 === total ? 'Done' : 'Next'}
      </button>
    </div>
  `
  document.body.appendChild(tip)
  tip.querySelector('#cog-tour-next')!.addEventListener('click', onNext)

  // Live tracking loop — updates box + tooltip every frame
  function trackPosition() {
    const r = el.getBoundingClientRect()
    box.style.top    = `${r.top    - pad}px`
    box.style.left   = `${r.left   - pad}px`
    box.style.width  = `${r.width  + pad * 2}px`
    box.style.height = `${r.height + pad * 2}px`

    const tipEl = document.getElementById('cog-tour-tooltip')
    if (tipEl) {
      const tipHeight  = tipEl.offsetHeight
      const spaceBelow = window.innerHeight - r.bottom
      const spaceAbove = r.top
      // Prefer below, fall back to above if not enough space
      if (spaceBelow >= tipHeight + 24 || spaceBelow >= spaceAbove) {
        tipEl.style.top = `${r.bottom + 12}px`
      } else {
        tipEl.style.top = `${r.top - tipHeight - 12}px`
      }
      tipEl.style.left = `${Math.max(8, Math.min(r.left, window.innerWidth - 296))}px`
    }

    _spotlightRafId = requestAnimationFrame(trackPosition)
  }

  _spotlightRafId = requestAnimationFrame(trackPosition)
}

function cleanupSpotlight() {
  if (_spotlightRafId !== null) {
    cancelAnimationFrame(_spotlightRafId)
    _spotlightRafId = null
  }
  document.getElementById('cog-tour-box')?.remove()
  document.getElementById('cog-tour-tooltip')?.remove()
}

/** Named export so index.ts can call it after an AI-triggered tour_action event. */
export function playTourSteps(steps: TourStep[], tourId?: string) {
  playTour(steps, 0, tourId)
}
