const WIDGET_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
  #cognity-bubble { position: fixed; bottom: 24px; right: 24px; width: 52px; height: 52px;
    border-radius: 50%; background: #1E40AF; cursor: pointer; display: flex;
    align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transition: transform 0.2s; z-index: 9999; }
  #cognity-bubble:hover { transform: scale(1.08); }
  #cognity-bubble svg { width: 24px; height: 24px; fill: white; }
  #cognity-panel { position: fixed; bottom: 88px; right: 24px; width: 360px; height: 480px;
    background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    display: flex; flex-direction: column; overflow: hidden; z-index: 9998;
    transition: opacity 0.2s, transform 0.2s; }
  #cognity-panel.hidden { opacity: 0; pointer-events: none; transform: translateY(8px); }
  #cognity-header { background: #1E40AF; padding: 16px; color: white; }
  #cognity-header h3 { font-size: 15px; font-weight: 600; }
  #cognity-header p { font-size: 12px; opacity: 0.8; margin-top: 2px; }
  #cognity-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
  .msg.assistant { background: #F1F5F9; color: #1E293B; align-self: flex-start; border-bottom-left-radius: 4px; }
  .msg.user { background: #1E40AF; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
  #cognity-input-area { padding: 12px; border-top: 1px solid #E2E8F0; display: flex; gap: 8px; }
  #cognity-input { flex: 1; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 24px;
    font-size: 14px; outline: none; }
  #cognity-input:focus { border-color: #1E40AF; }
  #cognity-send { background: #1E40AF; border: none; border-radius: 50%; width: 38px; height: 38px;
    cursor: pointer; display: flex; align-items: center; justify-content: center; }
  #cognity-send svg { width: 16px; height: 16px; fill: white; }
`

export function renderWidget(openingMessage: string, onSend: (msg: string) => void): {
  addMessage: (role: string, content: string) => void
  appendToLast: (text: string) => void
  showNudge: (text: string) => void
} {
  const host = document.createElement('div')
  host.id = 'cognity-root'
  document.body.appendChild(host)
  const shadow = host.attachShadow({ mode: 'closed' })

  const style = document.createElement('style')
  style.textContent = WIDGET_CSS
  shadow.appendChild(style)

  const bubble = document.createElement('div')
  bubble.id = 'cognity-bubble'
  bubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`
  shadow.appendChild(bubble)

  const panel = document.createElement('div')
  panel.id = 'cognity-panel'
  panel.classList.add('hidden')
  panel.innerHTML = `
    <div id="cognity-header"><h3>Cognity</h3><p>Your onboarding assistant</p></div>
    <div id="cognity-messages"></div>
    <div id="cognity-input-area">
      <input id="cognity-input" placeholder="Type a message..." />
      <button id="cognity-send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
    </div>`
  shadow.appendChild(panel)

  const messagesEl = shadow.getElementById('cognity-messages')!
  const input = shadow.getElementById('cognity-input') as HTMLInputElement
  const sendBtn = shadow.getElementById('cognity-send')!

  // Add opening message
  addMsg('assistant', openingMessage)

  bubble.addEventListener('click', () => panel.classList.toggle('hidden'))

  const handleSend = () => {
    const val = input.value.trim()
    if (!val) return
    addMsg('user', val)
    input.value = ''
    onSend(val)
  }

  sendBtn.addEventListener('click', handleSend)
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend() })

  function addMsg(role: string, content: string) {
    const div = document.createElement('div')
    div.className = `msg ${role}`
    div.textContent = content
    messagesEl.appendChild(div)
    messagesEl.scrollTop = messagesEl.scrollHeight
    return div
  }

  let lastAssistantEl: HTMLDivElement | null = null

  window.addEventListener('cognity:nudge', ((e: CustomEvent) => {
    panel.classList.remove('hidden')
    addMsg('assistant', e.detail)
  }) as EventListener)

  return {
    addMessage: (role, content) => { lastAssistantEl = addMsg(role, content) as HTMLDivElement },
    appendToLast: (text) => { if (lastAssistantEl) lastAssistantEl.textContent += text },
    showNudge: (text) => { panel.classList.remove('hidden'); addMsg('assistant', text) }
  }
}
