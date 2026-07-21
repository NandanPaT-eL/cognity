"use client"

import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import {
  ChevronUp, ChevronDown, Trash2, ExternalLink, Pencil, CheckCircle, AlertCircle
} from 'lucide-react'
import { PageHeader, DashboardCard, LoadingDots, Field } from '@/components/dashboard-ui'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

type Step = {
  id: string
  step_order: number
  fingerprint: string
  title: string
  body_text: string
  position: string
  page_url: string | null
}

type Tour = {
  id: string
  name: string
  page_url: string
  status: 'draft' | 'published'
  trigger_type: string
  steps: Step[]
}

export default function TourDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  const [tour,       setTour]       = useState<Tour | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [message,    setMessage]    = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Edit step state
  const [editingStep, setEditingStep] = useState<Step | null>(null)
  const [editTitle,   setEditTitle]   = useState('')
  const [editBody,    setEditBody]    = useState('')
  const [editPos,     setEditPos]     = useState('bottom')
  const [editSaving,  setEditSaving]  = useState(false)

  const authHeaders = async () => {
    const token = await getToken()
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  const fetchTour = async () => {
    setLoading(true)
    try {
      const headers = await authHeaders()
      const res     = await fetch(`${apiUrl}/tours/${id}`, { headers })
      if (res.ok) {
        const data = await res.json()
        setTour(data.tour)
      } else if (res.status === 404) {
        router.push('/dashboard/tours')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) fetchTour()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, id])

  const handlePublish = async () => {
    if (!tour) return
    const newStatus = tour.status === 'published' ? 'draft' : 'published'
    setPublishing(true)
    setMessage(null)
    try {
      const headers = await authHeaders()
      const res     = await fetch(`${apiUrl}/tours/${id}`, {
        method:  'PATCH',
        headers,
        body:    JSON.stringify({ status: newStatus }),
      })
      if (res.status === 402) {
        setMessage({ type: 'error', text: 'Published tour limit reached. Upgrade to publish more.' })
        return
      }
      if (res.ok) {
        setTour((prev) => prev ? { ...prev, status: newStatus } : prev)
        setMessage({
          type: 'success',
          text: newStatus === 'published' ? 'Tour published!' : 'Tour set back to draft.',
        })
      }
    } finally {
      setPublishing(false)
    }
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Delete this step?')) return
    setActionBusy(stepId)
    try {
      const headers = await authHeaders()
      await fetch(`${apiUrl}/tours/${id}/steps/${stepId}`, { method: 'DELETE', headers })
      setTour((prev) =>
        prev
          ? { ...prev, steps: prev.steps.filter((s) => s.id !== stepId) }
          : prev
      )
    } finally {
      setActionBusy(null)
    }
  }

  const handleReorder = async (steps: Step[]) => {
    const stepIds = steps.map((s) => s.id)
    try {
      const headers = await authHeaders()
      await fetch(`${apiUrl}/tours/${id}/reorder`, {
        method:  'POST',
        headers,
        body:    JSON.stringify({ stepIds }),
      })
    } catch {}
    // Optimistically update step_order locally
    setTour((prev) =>
      prev
        ? { ...prev, steps: steps.map((s, i) => ({ ...s, step_order: i + 1 })) }
        : prev
    )
  }

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (!tour) return
    const steps  = [...tour.steps]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= steps.length) return
    ;[steps[index], steps[target]] = [steps[target], steps[index]]
    handleReorder(steps)
  }

  const openEditStep = (step: Step) => {
    setEditingStep(step)
    setEditTitle(step.title)
    setEditBody(step.body_text)
    setEditPos(step.position)
  }

  const handleSaveStep = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingStep) return
    setEditSaving(true)
    try {
      const headers = await authHeaders()
      const res     = await fetch(`${apiUrl}/tours/${id}/steps/${editingStep.id}`, {
        method:  'PATCH',
        headers,
        body:    JSON.stringify({ title: editTitle, body_text: editBody, position: editPos }),
      })
      if (res.ok) {
        const { step } = await res.json()
        setTour((prev) =>
          prev
            ? { ...prev, steps: prev.steps.map((s) => (s.id === step.id ? step : s)) }
            : prev
        )
        setEditingStep(null)
      }
    } finally {
      setEditSaving(false)
    }
  }

  const captureUrl = tour ? `${tour.page_url}?cognity_edit=${tour.id}` : ''

  if (!isLoaded || loading) {
    return (
      <div className="cog-page max-w-3xl">
        <LoadingDots label="Loading tour…" />
      </div>
    )
  }

  if (!tour) return null

  return (
    <div className="cog-page max-w-3xl">
      <PageHeader
        eyebrow="Tours"
        title={tour.name}
        description={`Triggers on: ${tour.page_url}`}
      />

      {/* ── Actions row ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button
          id="back-to-tours"
          onClick={() => router.push('/dashboard/tours')}
          className="cog-btn-secondary text-[13px]"
        >
          ← All tours
        </button>

        {/* Capture button */}
        <button
          id="capture-steps-btn"
          onClick={() => window.open(captureUrl, '_blank')}
          className="flex items-center gap-2 cog-btn-secondary text-[13px]"
          disabled={!tour.page_url}
        >
          <ExternalLink className="h-4 w-4" />
          Capture steps on your site
        </button>

        {/* Publish button */}
        <button
          id="publish-tour-btn"
          onClick={handlePublish}
          disabled={publishing || (tour.status === 'draft' && tour.steps.length === 0)}
          className="cog-btn-primary text-[13px] flex items-center gap-2"
          style={
            tour.status === 'published'
              ? { background: 'rgba(180,83,9,0.85)' }
              : {}
          }
        >
          {publishing
            ? (tour.status === 'published' ? 'Unpublishing…' : 'Publishing…')
            : (tour.status === 'published' ? 'Unpublish' : 'Publish tour')}
        </button>
      </div>

      {/* Caption about capture */}
      <DashboardCard className="mb-6">
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-soft)' }}>
          <strong style={{ color: 'var(--void)' }}>How to add steps:</strong> Make sure the Cognity
          snippet is installed on your site, then click <em>Capture steps on your site</em> to open
          the page in Tour Editor mode. Click any element to add a step, then click{' '}
          <em>Done editing</em> when finished.
        </p>
      </DashboardCard>

      {/* Status message */}
      {message && (
        <div
          className="flex items-center gap-2 mb-5 text-[13px] font-medium"
          style={{ color: message.type === 'success' ? '#059669' : '#DC2626' }}
        >
          {message.type === 'success'
            ? <CheckCircle className="h-4 w-4" />
            : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* ── Steps list ────────────────────────────────────────────────── */}
      <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--void)' }}>
        Steps ({tour.steps.length})
      </h2>

      {tour.steps.length === 0 ? (
        <DashboardCard>
          <p className="py-8 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
            No steps yet — use the Capture button above to add steps from your site.
          </p>
        </DashboardCard>
      ) : (
        <div className="space-y-3">
          {tour.steps.map((step, index) => (
            <DashboardCard key={step.id} className="relative">
              <div className="flex items-start gap-4">
                {/* Step number */}
                <span
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
                  style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--purple)' }}
                >
                  {index + 1}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editingStep?.id === step.id ? (
                    /* ── Edit form ── */
                    <form onSubmit={handleSaveStep} className="space-y-3">
                      <Field label="Title" htmlFor={`edit-title-${step.id}`}>
                        <input
                          id={`edit-title-${step.id}`}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="cog-input"
                          required
                        />
                      </Field>
                      <Field label="Description" htmlFor={`edit-body-${step.id}`}>
                        <textarea
                          id={`edit-body-${step.id}`}
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          rows={3}
                          className="cog-input resize-none"
                          required
                        />
                      </Field>
                      <Field label="Position" htmlFor={`edit-pos-${step.id}`}>
                        <select
                          id={`edit-pos-${step.id}`}
                          value={editPos}
                          onChange={(e) => setEditPos(e.target.value)}
                          className="cog-input"
                        >
                          {['bottom', 'top', 'left', 'right'].map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </Field>
                      <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={editSaving} className="cog-btn-primary text-[13px]">
                          {editSaving ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingStep(null)}
                          className="cog-btn-secondary text-[13px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* ── Step display ── */
                    <>
                      <p className="font-semibold text-[14px]" style={{ color: 'var(--void)' }}>
                        {step.title}
                      </p>
                      <p className="text-[13px] mt-1 leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                        {step.body_text}
                      </p>
                      <code
                        className="block mt-2 text-[11px] px-2 py-1 rounded-md"
                        style={{
                          background: 'var(--mist)',
                          color:      'var(--text-muted)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {(() => {
                          try {
                            const fp = JSON.parse(step.fingerprint)
                            return `${step.page_url ?? '/'} · ${fp.tag}${fp.text ? ` "${fp.text.slice(0, 24)}"` : ''}`
                          } catch {
                            return step.page_url ?? '/'
                          }
                        })()}
                      </code>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                {editingStep?.id !== step.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      id={`move-up-${step.id}`}
                      onClick={() => moveStep(index, 'up')}
                      disabled={index === 0 || actionBusy === step.id}
                      className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                      style={{ color: 'var(--text-soft)' }}
                      aria-label="Move step up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      id={`move-down-${step.id}`}
                      onClick={() => moveStep(index, 'down')}
                      disabled={index === tour.steps.length - 1 || actionBusy === step.id}
                      className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                      style={{ color: 'var(--text-soft)' }}
                      aria-label="Move step down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      id={`edit-step-${step.id}`}
                      onClick={() => openEditStep(step)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--purple)' }}
                      aria-label="Edit step"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      id={`delete-step-${step.id}`}
                      onClick={() => handleDeleteStep(step.id)}
                      disabled={actionBusy === step.id}
                      className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                      style={{ color: '#DC2626' }}
                      aria-label="Delete step"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </DashboardCard>
          ))}
        </div>
      )}
    </div>
  )
}
