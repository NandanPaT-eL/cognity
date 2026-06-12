"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'

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
  // Derive the SDK base URL from the API URL (strip the /v1 suffix)
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
    <main className="p-10">
      <div className="max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-lead mb-2">Install</p>
          <h1 className="text-[28px] font-bold text-ink tracking-tight">Go live in 30 seconds</h1>
          <p className="mt-1 text-[14px] text-ink/50">
            Paste one line of code and Cognity appears in your product. No build step, no npm install.
          </p>
        </div>

        {!isLoaded ? (
          <LoadingDots label="Authenticating…" />
        ) : !isSignedIn ? (
          <p className="text-[14px] text-ink/40">Sign in to view your install snippet.</p>
        ) : loading ? (
          <LoadingDots label="Loading…" />
        ) : !org ? (
          <p className="text-[14px] text-ink/40">Could not load org info.</p>
        ) : (
          <div className="space-y-5 animate-fade-up">

            {/* API Key */}
            <div className="rounded-xl border border-ink/08 bg-white p-6 shadow-card">
              <h2 className="text-[14px] font-semibold text-ink mb-0.5">API Key</h2>
              <p className="text-[12px] text-ink/40 mb-4">Keep this secret. It authenticates your SDK installation.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 rounded-lg bg-paper border border-ink/08 px-3 py-2.5 font-mono text-[13px] text-ink truncate">
                  {keyVisible ? org.api_key : maskedKey}
                </code>
                <IconBtn
                  onClick={() => setKeyVisible(v => !v)}
                  label={keyVisible ? 'Hide key' : 'Reveal key'}
                >
                  {keyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </IconBtn>
                <IconBtn onClick={() => copy(org.api_key, setKeyCopied)} label="Copy key">
                  {keyCopied ? <Check className="h-4 w-4 text-lead" /> : <Copy className="h-4 w-4" />}
                </IconBtn>
              </div>
            </div>

            {/* Snippet */}
            <div className="rounded-xl border border-ink/08 bg-white p-6 shadow-card">
              <h2 className="text-[14px] font-semibold text-ink mb-0.5">Install snippet</h2>
              <p className="text-[12px] text-ink/40 mb-4">
                Paste inside{' '}
                <code className="font-mono text-[11px] bg-paper border border-ink/08 px-1 py-0.5 rounded">&lt;head&gt;</code>
                {' '}or before{' '}
                <code className="font-mono text-[11px] bg-paper border border-ink/08 px-1 py-0.5 rounded">&lt;/body&gt;</code>
                {' '}on every page.
              </p>
              <div className="relative">
                <pre className="rounded-lg bg-ink text-[13px] leading-relaxed text-white/80 font-mono px-5 py-4 overflow-x-auto pr-12 whitespace-pre">
                  {snippet}
                </pre>
                <button
                  onClick={() => copy(snippet, setSnippetCopied)}
                  className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-[11px] font-medium text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                  aria-label="Copy snippet"
                >
                  {snippetCopied ? <Check className="h-3.5 w-3.5 text-lead" /> : <Copy className="h-3.5 w-3.5" />}
                  {snippetCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Done callout */}
            <div className="rounded-xl border border-lead/20 bg-lead/06 px-5 py-4">
              <p className="text-[13px] font-semibold text-lead mb-0.5">That's it.</p>
              <p className="text-[12px] text-lead/70">
                Cognity will appear as a chat bubble in the bottom-right corner. No additional setup required.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function IconBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-lg border border-ink/12 p-2.5 text-ink/40 hover:border-ink/20 hover:text-ink/70 transition-colors"
      aria-label={label}
    >
      {children}
    </button>
  )
}

function LoadingDots({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-[14px] text-ink/40 py-8">
      <span className="flex gap-1">
        {[0,1,2].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-lead animate-pulse-dot" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </span>
      {label}
    </div>
  )
}