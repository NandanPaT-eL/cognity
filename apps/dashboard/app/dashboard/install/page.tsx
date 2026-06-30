"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Eye, EyeOff, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react'
import { Callout, DashboardCard, IconBtn, LoadingDots, PageHeader } from '@/components/dashboard-ui'

type OrgInfo = { id: string; name: string; api_key: string }
type SnippetTab = 'nextjs' | 'vite' | 'html'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

function SnippetBlock({
  label,
  code,
  onCopy,
  copied,
}: {
  label:     string
  code:      string
  onCopy:    () => void
  copied:    boolean
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <div className="relative">
        <pre
          className="rounded-2xl text-[12px] leading-relaxed font-mono px-5 py-4 overflow-x-auto whitespace-pre"
          style={{
            background:   'var(--void)',
            color:        'rgba(196,181,253,0.85)',
            paddingRight: '88px',
          }}
        >
          {code}
        </pre>
        <button
          onClick={onCopy}
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150"
          style={{
            background: 'rgba(255,255,255,0.10)',
            color:      copied ? '#C4B5FD' : 'rgba(255,255,255,0.55)',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={e => (e.currentTarget.style.color = copied ? '#C4B5FD' : 'rgba(255,255,255,0.55)')}
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

export default function InstallPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [org, setOrg]                     = useState<OrgInfo | null>(null)
  const [loading, setLoading]             = useState(true)
  const [keyVisible, setKeyVisible]       = useState(false)
  const [keyCopied, setKeyCopied]         = useState(false)
  const [envCopied, setEnvCopied]         = useState(false)
  const [snippetCopied, setSnippetCopied] = useState(false)
  const [activeTab, setActiveTab]         = useState<SnippetTab>('nextjs')

  const [rotateConfirm, setRotateConfirm] = useState(false)
  const [rotating, setRotating]           = useState(false)
  const [rotateError, setRotateError]     = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    const load = async () => {
      const token = await getToken()
      const res = await fetch(`${apiUrl}/org/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) setOrg(await res.json())
      setLoading(false)
    }
    load().catch(() => setLoading(false))
  }, [getToken, isLoaded, isSignedIn])

  const sdkBase = apiUrl.replace(/\/v1$/, '')

  const envLine = org ? `COGNITY_API_KEY=${org.api_key}` : ''

  const snippets = useMemo(() => {
    if (!org) return { nextjs: '', vite: '', html: '' }

    const nextjs = `// app/layout.tsx
// Add COGNITY_API_KEY to .env.local (server-only — never commit this file)
import Script from 'next/script'

const sdkUrl = process.env.COGNITY_SDK_URL ?? '${sdkBase}'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src={\`\${sdkUrl}/sdk/index.js\`}
          data-key={process.env.COGNITY_API_KEY!}
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}`

    const vite = `# .env.local — add your key here (do not commit)
VITE_COGNITY_API_KEY=<paste COGNITY_API_KEY from step 1>
VITE_COGNITY_SDK_URL=${sdkBase}

// src/main.tsx (or App.tsx)
const apiKey = import.meta.env.VITE_COGNITY_API_KEY
const sdkUrl = import.meta.env.VITE_COGNITY_SDK_URL

if (apiKey && sdkUrl) {
  const script = document.createElement('script')
  script.src = \`\${sdkUrl}/sdk/index.js\`
  script.dataset.key = apiKey
  script.defer = true
  document.body.appendChild(script)
}`

    const html = `# .env (or your host's secret config)
COGNITY_API_KEY=<paste your key from the dashboard>

<!-- Inject the key at build/deploy time — do not hardcode in source -->
<script src="${sdkBase}/sdk/index.js" data-key="${org.api_key}" defer></script>`

    return { nextjs, vite, html }
  }, [org, sdkBase])

  const activeSnippet = snippets[activeTab]

  const copy = async (text: string, set: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text)
    set(true)
    setTimeout(() => set(false), 2000)
  }

  const handleRotateKey = async () => {
    if (!rotateConfirm) {
      setRotateConfirm(true)
      return
    }
    setRotating(true)
    setRotateError(null)
    try {
      const token = await getToken()
      const res   = await fetch(`${apiUrl}/org/rotate-key`, {
        method:  'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Request failed: ${res.status}`)
      }
      const { api_key } = await res.json()
      setOrg((prev) => prev ? { ...prev, api_key } : prev)
      setRotateConfirm(false)
      setKeyVisible(true)
    } catch (err) {
      setRotateError(err instanceof Error ? err.message : 'Failed to rotate key')
    } finally {
      setRotating(false)
    }
  }

  const cancelRotate = () => {
    setRotateConfirm(false)
    setRotateError(null)
  }

  const maskedKey = org ? `${org.api_key.slice(0, 10)}${'•'.repeat(22)}` : ''

  const tabs: { id: SnippetTab; label: string }[] = [
    { id: 'nextjs', label: 'Next.js' },
    { id: 'vite',   label: 'Vite / React' },
    { id: 'html',   label: 'HTML / Node' },
  ]

  return (
    <div className="cog-page max-w-2xl">
      <PageHeader
        eyebrow="Install"
        title="Go live in 30 seconds"
        description="Store your API key in .env — never hardcode it in source. Paste the snippet for your stack below."
      />

      {!isLoaded ? (
        <LoadingDots label="Authenticating…" />
      ) : !isSignedIn ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to view your install snippet.</p>
      ) : loading ? (
        <LoadingDots label="Loading…" />
      ) : !org ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Could not load org info.</p>
      ) : (
        <div className="space-y-5 animate-fade-up">

          {/* Step 1 — .env */}
          <DashboardCard>
            <h2 className="text-[14px] font-bold mb-0.5" style={{ color: 'var(--void)' }}>
              1. Add to your <code className="font-mono text-[12px]">.env</code>
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Copy this line into <code className="font-mono text-[11px]">.env.local</code> (Next.js) or{' '}
              <code className="font-mono text-[11px]">.env</code> (Vite/Node). Add the file to{' '}
              <code className="font-mono text-[11px]">.gitignore</code> — never commit secrets.
            </p>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 min-w-0 rounded-xl font-mono text-[13px] truncate px-3 py-2.5"
                style={{
                  background: 'var(--mist)',
                  border:     '1px solid var(--border)',
                  color:      'var(--void)',
                }}
              >
                {keyVisible ? envLine : `COGNITY_API_KEY=${maskedKey.slice('COGNITY_API_KEY='.length)}`}
              </code>
              <IconBtn onClick={() => setKeyVisible(v => !v)} label={keyVisible ? 'Hide key' : 'Reveal key'}>
                {keyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </IconBtn>
              <IconBtn onClick={() => copy(envLine, setEnvCopied)} label="Copy .env line">
                {envCopied
                  ? <Check className="h-4 w-4" style={{ color: 'var(--purple)' }} />
                  : <Copy className="h-4 w-4" />}
              </IconBtn>
            </div>
          </DashboardCard>

          {/* API Key management */}
          <DashboardCard>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="text-[14px] font-bold mb-0.5" style={{ color: 'var(--void)' }}>API key</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Used as <code className="font-mono text-[11px]">COGNITY_API_KEY</code> in your environment.
                </p>
              </div>

              {!rotateConfirm ? (
                <button
                  id="rotate-api-key-btn"
                  onClick={handleRotateKey}
                  disabled={rotating}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold shrink-0 transition-all duration-150"
                  style={{
                    background: 'var(--mist)',
                    border:     '1px solid var(--border)',
                    color:      'var(--text-soft)',
                    cursor:     'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--void)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-soft)')}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate key
                </button>
              ) : (
                <div
                  className="flex flex-col gap-2 rounded-xl p-3 shrink-0 max-w-[200px]"
                  style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.20)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: '#dc2626' }} />
                    <p className="text-[11px] font-medium leading-snug" style={{ color: '#dc2626' }}>
                      This will break any existing SDK installation. Continue?
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      id="rotate-api-key-confirm"
                      onClick={handleRotateKey}
                      disabled={rotating}
                      className="flex-1 rounded-lg px-2 py-1 text-[11px] font-bold text-white"
                      style={{ background: '#dc2626', border: 'none', cursor: rotating ? 'not-allowed' : 'pointer', opacity: rotating ? 0.6 : 1 }}
                    >
                      {rotating ? 'Rotating…' : 'Yes, rotate'}
                    </button>
                    <button
                      id="rotate-api-key-cancel"
                      onClick={cancelRotate}
                      disabled={rotating}
                      className="flex-1 rounded-lg px-2 py-1 text-[11px] font-medium"
                      style={{ background: 'var(--mist)', border: '1px solid var(--border)', color: 'var(--text-soft)', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {rotateError && (
              <p className="text-[12px] mb-3" style={{ color: '#dc2626' }}>{rotateError}</p>
            )}

            <div className="flex items-center gap-2">
              <code
                className="flex-1 min-w-0 rounded-xl font-mono text-[13px] truncate px-3 py-2.5"
                style={{
                  background: 'var(--mist)',
                  border:     '1px solid var(--border)',
                  color:      'var(--void)',
                }}
              >
                {keyVisible ? org.api_key : maskedKey}
              </code>
              <IconBtn onClick={() => copy(org.api_key, setKeyCopied)} label="Copy key">
                {keyCopied
                  ? <Check className="h-4 w-4" style={{ color: 'var(--purple)' }} />
                  : <Copy className="h-4 w-4" />}
              </IconBtn>
            </div>
          </DashboardCard>

          {/* Step 2 — Install snippet */}
          <DashboardCard>
            <h2 className="text-[14px] font-bold mb-0.5" style={{ color: 'var(--void)' }}>
              2. Install in your app
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Snippets read <code className="font-mono text-[11px]">COGNITY_API_KEY</code> from your environment — the key is never shown in source code.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {tabs.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className="rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-150"
                  style={{
                    background: activeTab === id ? 'var(--purple)' : 'var(--mist)',
                    color:      activeTab === id ? '#fff' : 'var(--text-soft)',
                    border:     activeTab === id ? 'none' : '1px solid var(--border)',
                    cursor:     'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <SnippetBlock
              label={tabs.find(t => t.id === activeTab)?.label ?? 'Snippet'}
              code={activeSnippet}
              onCopy={() => copy(activeSnippet, setSnippetCopied)}
              copied={snippetCopied}
            />
            <Callout>
              <p className="text-xs" style={{ color: 'var(--text-soft)' }}>
                Set your allowed domain in{' '}
                <Link href="/dashboard/settings" className="font-semibold" style={{ color: 'var(--purple)' }}>
                  Settings → Security
                </Link>{' '}
                to prevent API key misuse.
              </p>
            </Callout>
          </DashboardCard>

          <Callout>
            <p className="text-[13px] font-bold mb-0.5" style={{ color: 'var(--void)' }}>That&apos;s it.</p>
            <p className="text-xs" style={{ color: 'var(--text-soft)' }}>
              Cognity appears as a chat bubble in the bottom-right corner. Keep{' '}
              <code className="font-mono text-[11px]">COGNITY_API_KEY</code> in env vars only — not in git, not in client-side source files you commit.
            </p>
          </Callout>
        </div>
      )}
    </div>
  )
}
