"use client"

import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit2, Globe, FileText } from 'lucide-react'
import { PageHeader, DashboardCard, LoadingDots, Field } from '@/components/dashboard-ui'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

type Tour = {
  id: string
  name: string
  page_url: string
  status: 'draft' | 'published'
  trigger_type: string
  step_count: number
  created_at: string
}

export default function ToursPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  const [tours,      setTours]      = useState<Tour[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [formName,   setFormName]   = useState('')
  const [formUrl,    setFormUrl]    = useState('')
  const [creating,   setCreating]   = useState(false)
  const [formError,  setFormError]  = useState('')
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const authHeaders = async () => {
    const token = await getToken()
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  const fetchTours = async () => {
    setLoading(true)
    try {
      const headers = await authHeaders()
      const res     = await fetch(`${apiUrl}/tours`, { headers })
      if (res.ok) {
        const data = await res.json()
        setTours(data.tours ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) fetchTours()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formUrl.trim()) {
      setFormError('Both fields are required.')
      return
    }
    setCreating(true)
    setFormError('')
    try {
      const headers = await authHeaders()
      const res     = await fetch(`${apiUrl}/tours`, {
        method:  'POST',
        headers,
        body:    JSON.stringify({ name: formName.trim(), page_url: formUrl.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setFormError(data.error ?? 'Failed to create tour.')
        setCreating(false)
        return
      }
      const { tour } = await res.json()
      router.push(`/dashboard/tours/${tour.id}`)
    } catch {
      setFormError('Network error. Please try again.')
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tour and all its steps?')) return
    setDeletingId(id)
    try {
      const token = await getToken()
      const res   = await fetch(`${apiUrl}/tours/${id}`, {
        method:  'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert((data as { error?: string }).error ?? 'Failed to delete tour')
        return
      }
      setTours((prev) => prev.filter((t) => t.id !== id))
    } catch {
      alert('Network error — could not delete tour')
    } finally {
      setDeletingId(null)
    }
  }

  const handleTogglePublish = async (tour: Tour) => {
    const newStatus = tour.status === 'published' ? 'draft' : 'published'
    setActionBusy(tour.id)
    try {
      const headers = await authHeaders()
      const res     = await fetch(`${apiUrl}/tours/${tour.id}`, {
        method:  'PATCH',
        headers,
        body:    JSON.stringify({ status: newStatus }),
      })
      if (res.status === 402) {
        alert('Published tour limit reached for your plan. Upgrade to publish more tours.')
        return
      }
      if (res.ok) {
        setTours((prev) =>
          prev.map((t) => (t.id === tour.id ? { ...t, status: newStatus } : t))
        )
      }
    } finally {
      setActionBusy(null)
    }
  }

  return (
    <div className="cog-page max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <PageHeader
          eyebrow="Tours"
          title="Product Tours"
          description="Create visual no-code walkthroughs that guide users through your product step by step."
        />
        <button
          id="new-tour-btn"
          onClick={() => { setShowForm(true); setFormError('') }}
          className="cog-btn-primary flex items-center gap-2 shrink-0 mt-1"
        >
          <Plus className="h-4 w-4" />
          New Tour
        </button>
      </div>

      {/* ── New tour form ─────────────────────────────────────────── */}
      {showForm && (
        <DashboardCard className="mb-6 animate-fade-up">
          <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--void)' }}>
            Create a new tour
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Tour name" htmlFor="tour-name">
              <input
                id="tour-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Onboarding walkthrough"
                className="cog-input"
                required
              />
            </Field>
            <Field label="Page URL" htmlFor="tour-url" hint="path or full URL, e.g. /dashboard or /settings">
              <input
                id="tour-url"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="/dashboard"
                className="cog-input"
                required
              />
            </Field>
            {formError && (
              <p className="text-[13px]" style={{ color: '#DC2626' }}>{formError}</p>
            )}
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={creating} className="cog-btn-primary">
                {creating ? 'Creating…' : 'Create tour'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="cog-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </DashboardCard>
      )}

      {/* ── Tours table ───────────────────────────────────────────── */}
      {!isLoaded || loading ? (
        <LoadingDots label="Loading tours…" />
      ) : tours.length === 0 ? (
        <DashboardCard>
          <div className="flex flex-col items-center py-12 gap-3">
            <FileText className="h-10 w-10" style={{ color: 'var(--text-muted)' }} />
            <p className="text-[14px]" style={{ color: 'var(--text-soft)' }}>
              No tours yet. Create your first one above.
            </p>
          </div>
        </DashboardCard>
      ) : (
        <DashboardCard className="overflow-hidden p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Tour name', 'Page URL', 'Status', 'Steps', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left font-semibold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr
                  key={tour.id}
                  style={{ borderBottom: '1px solid var(--border)' }}
                  className="group transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--void)' }}>
                    {tour.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--text-soft)' }}>
                      <Globe className="h-3.5 w-3.5 shrink-0" />
                      <code className="text-[12px]">{tour.page_url}</code>
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={
                        tour.status === 'published'
                          ? { background: 'rgba(16,185,129,0.12)', color: '#059669' }
                          : { background: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)' }
                      }
                    >
                      {tour.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 tabular-nums" style={{ color: 'var(--text-soft)' }}>
                    {tour.step_count ?? 0}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        id={`edit-tour-${tour.id}`}
                        onClick={() => router.push(`/dashboard/tours/${tour.id}`)}
                        className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--purple)', background: 'rgba(124,58,237,0.08)' }}
                      >
                        <Edit2 className="h-3.5 w-3.5 inline mr-1" />
                        Edit
                      </button>
                      <button
                        id={`toggle-publish-${tour.id}`}
                        disabled={actionBusy === tour.id}
                        onClick={() => handleTogglePublish(tour)}
                        className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                        style={{
                          color:      tour.status === 'published' ? '#b45309' : '#059669',
                          background: tour.status === 'published'
                            ? 'rgba(180,83,9,0.08)'
                            : 'rgba(5,150,105,0.08)',
                        }}
                      >
                        {tour.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        id={`delete-tour-${tour.id}`}
                        disabled={actionBusy === tour.id || deletingId === tour.id}
                        onClick={() => handleDelete(tour.id)}
                        className="rounded-lg p-1.5 transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label="Delete tour"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashboardCard>
      )}
    </div>
  )
}
