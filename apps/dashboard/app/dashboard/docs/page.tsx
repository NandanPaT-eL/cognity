"use client"

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

export default function DocsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [fileName, setFileName]       = useState('product-docs.txt')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedText, setParsedText]   = useState('')
  const [status, setStatus]           = useState<'idle' | 'saving'>('idle')
  const [message, setMessage]         = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
      setMessage({ type: 'error', text: 'Failed to save documentation. Please try again.' })
      setStatus('idle')
      return
    }

    setMessage({ type: 'success', text: 'Documentation saved and queued for embedding.' })
    setParsedText('')
    setSelectedFile(null)
    setStatus('idle')
  }

  return (
    <main className="p-10">
      <div className="max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-lead mb-2">Documentation</p>
          <h1 className="text-[28px] font-bold text-ink tracking-tight">Train the assistant</h1>
          <p className="mt-1 text-[14px] text-ink/50">
            Upload your product docs or paste text. Cognity reads them to guide users accurately.
          </p>
        </div>

        {!isLoaded ? (
          <LoadingDots label="Authenticating…" />
        ) : !isSignedIn ? (
          <p className="text-[14px] text-ink/40">Sign in to upload documentation.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up">

            {/* File name */}
            <Field label="File name" htmlFor="file_name">
              <input
                id="file_name"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                className="cog-input"
              />
            </Field>

            {/* File upload */}
            <Field label="Upload file" htmlFor="file" hint="PDF, TXT, MD, CSV, HTML supported">
              <label
                htmlFor="file"
                className="flex items-center gap-3 rounded-lg border border-dashed border-ink/20 bg-paper px-4 py-4 cursor-pointer hover:border-lead/40 hover:bg-lead/04 transition-colors"
              >
                <Upload className="h-4 w-4 text-ink/30 shrink-0" />
                <span className="text-[13px] text-ink/50">
                  {selectedFile ? selectedFile.name : 'Click to choose a file…'}
                </span>
                <input
                  id="file"
                  type="file"
                  accept=".txt,.md,.csv,.json,.html,.htm,.pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            </Field>

            {/* Text paste */}
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

            {/* Footer */}
            <div className="flex items-center gap-4 pt-1">
              <button
                type="submit"
                disabled={status === 'saving' || (!selectedFile && parsedText.trim().length === 0)}
                className="cog-btn-primary"
              >
                {status === 'saving' ? 'Saving…' : 'Save documentation'}
              </button>
              {message && (
                <span className={`flex items-center gap-1.5 text-[13px] ${message.type === 'success' ? 'text-lead' : 'text-red-600'}`}>
                  {message.type === 'success'
                    ? <CheckCircle className="h-4 w-4" />
                    : <AlertCircle className="h-4 w-4" />}
                  {message.text}
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </main>
  )
}

function Field({ label, htmlFor, hint, children }: {
  label: string; htmlFor: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline gap-2 text-[13px] font-medium text-ink">
        {label}
        {hint && <span className="text-[11px] font-normal text-ink/40">{hint}</span>}
      </label>
      {children}
    </div>
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