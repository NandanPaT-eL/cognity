export interface CognityConfig {
  apiKey: string
  apiUrl?: string
}

export interface ElementFingerprint {
  domPath:   number[]     // sibling indices walking up to body, e.g. [2, 0, 3, 1]
  tag:       string       // tagName lowercase e.g. "button"
  text:      string       // trimmed textContent, max 60 chars
  parentTag: string       // immediate parent tagName lowercase
  rect: {
    widthBand:  'xs' | 'sm' | 'md' | 'lg' | 'xl'  // <80, <200, <400, <700, 700+
    heightBand: 'xs' | 'sm' | 'md' | 'lg'          // <24, <48, <80, 80+
  }
}

export interface Session {
  session_id:      string
  opening_message: string
  status:          string
  messages?:       Array<{ role: string; content: string }>
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}
