"use client"

import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Upload, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { Field, LoadingDots, PageHeader } from '@/components/dashboard-ui'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

type DocRecord = {
  id: string
  source_name?: string
  file_name?: string
  created_at: string
}

export default function DocsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [fileName, setFileName]         = useState('product-docs.txt')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedText, setParsedText]     = useState('')
  const [status, setStatus]             = useState<'idle' | 'saving'>('idle')
  const [message, setMessage]           = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showUpgradeLink, setShowUpgradeLink] = useState(false)
  const [docs, setDocs]                 = useState<DocRecord[]>([])
  const [docsLoading, setDocsLoading]   = useState(false)

  const loadDocs = async () => {
    setDocsLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${apiUrl}/documents`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        setDocs(data.documents ?? [])
      }
    } catch {
      // non-fatal
    } finally {
      setDocsLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    loadDocs().catch(() => {})
  }, [isLoaded, isSignedIn]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setFileName(file.name)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedFile && !parsedText.trim()) {
      setMessage({ type: 'error', text: 'Add a file or paste documentation text first.' })
      return
    }
    setStatus('saving')
    setMessage(null)
    setShowUpgradeLink(false)
    const token = await getToken()
    const payload = new FormData()
    if (selectedFile) payload.append('file', selectedFile)
    payload.append('file_name', fileName)
    if (parsedText.trim()) payload.append('parsed_text', parsedText.trim())
    const res = await fetch(`${apiUrl}/documents`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: payload
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (res.status === 402) {
        setMessage({
          type: 'error',
          text: 'Document limit reached for your plan. Upgrade to add more documents.',
        })
        setShowUpgradeLink(true)
      } else {
        setMessage({ type: 'error', text: 'Failed to save documentation. Please try again.' })
        setShowUpgradeLink(false)
      }
      setStatus('idle')
      return
    }
    setMessage({ type: 'success', text: 'Documentation saved and queued for embedding.' })
    setParsedText('')
    setSelectedFile(null)
    setStatus('idle')
    // Refresh doc list
    await loadDocs()
  }

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Delete this document?')) return
    const token = await getToken()
    try {
      const res = await fetch(`${apiUrl}/documents/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert((data as { error?: string }).error ?? 'Failed to delete document')
        return
      }
      setDocs(prev => prev.filter(d => d.id !== id))
    } catch {
      alert('Network error — could not delete document')
    }
  }

  return (
    <div className="cog-page max-w-3xl">
      <PageHeader
        eyebrow="Documentation"
        title="Train the assistant"
        description="Upload your product docs or paste text. Cognity reads them to guide users accurately."
      />

      {!isLoaded ? (
        <LoadingDots label="Authenticating…" />
      ) : !isSignedIn ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to upload documentation.</p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up">
            <Field label="File name" htmlFor="file_name">
              <input id="file_name" value={fileName} onChange={e => setFileName(e.target.value)} className="cog-input" />
            </Field>

            <Field label="Upload file" htmlFor="file" hint="PDF, TXT, MD, CSV, HTML supported">
              <label
                htmlFor="file"
                className="flex items-center gap-3 rounded-2xl cursor-pointer transition-all duration-150 px-5 py-5 border-[1.5px] border-dashed"
                style={{
                  borderColor: 'rgba(124,58,237,0.20)',
                  background: 'var(--mist)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.45)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.20)')}
              >
                <Upload className="h-4 w-4 shrink-0" style={{ color: 'var(--purple)' }} />
                <span className="text-[13px]" style={{ color: 'var(--text-soft)' }}>
                  {selectedFile ? selectedFile.name : 'Click to choose a file…'}
                </span>
                <input id="file" type="file" accept=".txt,.md,.csv,.json,.html,.htm,.pdf" onChange={handleFileChange} className="sr-only" />
              </label>
            </Field>

            <Field label="Or paste documentation text" htmlFor="parsed_text">
              <textarea
                id="parsed_text"
                value={parsedText}
                onChange={e => setParsedText(e.target.value)}
                placeholder="Paste your onboarding docs, help articles, or setup steps here…"
                rows={12}
                className="cog-input resize-none font-mono text-[13px]"
              />
            </Field>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="submit"
                disabled={status === 'saving' || (!selectedFile && parsedText.trim().length === 0)}
                className="cog-btn-primary"
              >
                {status === 'saving' ? 'Saving…' : 'Save documentation'}
              </button>
              <div>
                {message && (
                  <span
                    className="flex items-center gap-1.5 text-[13px] font-medium"
                    style={{ color: message.type === 'success' ? 'var(--purple)' : '#DC2626' }}
                  >
                    {message.type === 'success'
                      ? <CheckCircle className="h-4 w-4 shrink-0" />
                      : <AlertCircle className="h-4 w-4 shrink-0" />}
                    {message.text}
                  </span>
                )}
                {showUpgradeLink && (
                  <a
                    href="/#pricing"
                    style={{
                      fontSize: '13px',
                      color: 'var(--purple)',
                      textDecoration: 'underline',
                      display: 'block',
                      marginTop: '6px',
                    }}
                  >
                    View upgrade options →
                  </a>
                )}
              </div>
            </div>
          </form>

          {/* ── Existing documents list ─────────────────────────────────── */}
          <div className="mt-10">
            <p className="text-[13px] font-semibold mb-3" style={{ color: 'var(--void)' }}>
              Uploaded documents
            </p>
            {docsLoading ? (
              <LoadingDots label="Loading documents…" />
            ) : docs.length === 0 ? (
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>No documents yet.</p>
            ) : (
              <ul className="space-y-2">
                {docs.map(doc => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
                    style={{ border: '1px solid rgba(14,11,26,0.08)', background: 'var(--canvas)' }}
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate" style={{ color: 'var(--void)' }}>
                        {doc.source_name ?? doc.file_name ?? doc.id}
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Added {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="shrink-0 flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[12px] font-medium transition-all duration-150"
                      style={{
                        background: 'rgba(220,38,38,0.06)',
                        border: '1px solid rgba(220,38,38,0.18)',
                        color: '#dc2626',
                        cursor: 'pointer',
                      }}
                      aria-label="Delete document"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
