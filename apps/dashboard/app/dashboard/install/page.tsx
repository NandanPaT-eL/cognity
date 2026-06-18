"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'
import { Callout, DashboardCard, IconBtn, LoadingDots, PageHeader } from '@/components/dashboard-ui'

type OrgInfo = { id: string; name: string; api_key: string }

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

export default function InstallPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [org, setOrg]                     = useState<OrgInfo | null>(null)
  const [loading, setLoading]             = useState(true)
  const [keyVisible, setKeyVisible]       = useState(false)
  const [keyCopied, setKeyCopied]         = useState(false)
  const [snippetCopied, setSnippetCopied] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    const load = async () => {
      const token = await getToken()
      const res = await fetch(`${apiUrl}/org/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (res.ok) setOrg(await res.json())
      setLoading(false)
    }
    load().catch(() => setLoading(false))
  }, [getToken, isLoaded, isSignedIn])

  const maskedKey = org ? `${org.api_key.slice(0, 10)}${'•'.repeat(22)}` : ''
  const sdkBase   = apiUrl.replace(/\/v1$/, '')
  const snippet   = org
    ? `<script\n  src="${sdkBase}/sdk/index.js"\n  data-key="${org.api_key}"\n  defer\n></script>`
    : ''

  const copy = async (text: string, set: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text)
    set(true)
    setTimeout(() => set(false), 2000)
  }

  return (
    <div className="cog-page max-w-2xl">
      <PageHeader
        eyebrow="Install"
        title="Go live in 30 seconds"
        description="Paste one line of code and Cognity appears in your product. No build step, no npm install."
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

          {/* API Key card */}
          <DashboardCard>
            <h2 className="text-[14px] font-bold mb-0.5" style={{ color: 'var(--void)' }}>API Key</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Keep this secret. It authenticates your SDK installation.
            </p>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 min-w-0 rounded-xl font-mono text-[13px] truncate px-3 py-2.5"
                style={{
                  background: 'var(--mist)',
                  border: '1px solid var(--border)',
                  color: 'var(--void)',
                }}
              >
                {keyVisible ? org.api_key : maskedKey}
              </code>
              <IconBtn onClick={() => setKeyVisible(v => !v)} label={keyVisible ? 'Hide key' : 'Reveal key'}>
                {keyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </IconBtn>
              <IconBtn onClick={() => copy(org.api_key, setKeyCopied)} label="Copy key">
                {keyCopied
                  ? <Check className="h-4 w-4" style={{ color: 'var(--purple)' }} />
                  : <Copy className="h-4 w-4" />}
              </IconBtn>
            </div>
          </DashboardCard>

          {/* Snippet card */}
          <DashboardCard>
            <h2 className="text-[14px] font-bold mb-0.5" style={{ color: 'var(--void)' }}>Install snippet</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Paste inside{' '}
              <code className="font-mono text-[11px] rounded px-1 py-0.5"
                    style={{ background: 'var(--mist)', color: 'var(--text-soft)' }}>
                &lt;head&gt;
              </code>
              {' '}or before{' '}
              <code className="font-mono text-[11px] rounded px-1 py-0.5"
                    style={{ background: 'var(--mist)', color: 'var(--text-soft)' }}>
                &lt;/body&gt;
              </code>
              {' '}on every page.
            </p>
            <div className="relative">
              <pre
                className="rounded-2xl text-[13px] leading-relaxed font-mono px-5 py-4 overflow-x-auto whitespace-pre"
                style={{
                  background: 'var(--void)',
                  color: 'rgba(196,181,253,0.85)',   /* lilac tint on dark bg */
                  paddingRight: '88px',
                }}
              >
                {snippet}
              </pre>
              <button
                onClick={() => copy(snippet, setSnippetCopied)}
                className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  color: snippetCopied ? '#C4B5FD' : 'rgba(255,255,255,0.55)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={e => (e.currentTarget.style.color = snippetCopied ? '#C4B5FD' : 'rgba(255,255,255,0.55)')}
                aria-label="Copy snippet"
              >
                {snippetCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {snippetCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </DashboardCard>

          {/* Callout */}
          <Callout>
            <p className="text-[13px] font-bold mb-0.5" style={{ color: 'var(--void)' }}>That&apos;s it.</p>
            <p className="text-xs" style={{ color: 'var(--text-soft)' }}>
              Cognity will appear as a chat bubble in the bottom-right corner. No additional setup required.
            </p>
          </Callout>
        </div>
      )}
    </div>
  )
}
