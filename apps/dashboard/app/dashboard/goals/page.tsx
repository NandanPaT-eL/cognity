"use client"

import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '@clerk/nextjs'
import { CheckCircle, AlertCircle, Target, Trash2 } from 'lucide-react'
import { LoadingDots, PageHeader } from '@/components/dashboard-ui'

type ActivationGoal = {
  id: string
  event_name: string
  description: string
  created_at: string
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

export default function GoalsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [eventName, setEventName]     = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal]               = useState<ActivationGoal | null>(null)
  const [status, setStatus]           = useState<'idle' | 'loading' | 'saving'>('idle')
  const [message, setMessage]         = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    const load = async () => {
      setStatus('loading')
      const token = await getToken()
      const res = await fetch(`${apiUrl}/activation-goal`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (res.ok) {
        const data = await res.json()
        const g = data.activation_goal as ActivationGoal | null
        setGoal(g)
        setEventName(g?.event_name ?? '')
        setDescription(g?.description ?? '')
      }
      setStatus('idle')
    }
    load().catch(() => setStatus('idle'))
  }, [getToken, isLoaded, isSignedIn])

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('saving')
    setMessage(null)
    const token = await getToken()
    const res = await fetch(`${apiUrl}/activation-goal`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ event_name: eventName, description })
    })
    if (!res.ok) {
      setMessage({ type: 'error', text: 'Failed to save activation goal.' })
      setStatus('idle')
      return
    }
    const data = await res.json()
    setGoal(data.activation_goal)
    setMessage({ type: 'success', text: 'Activation goal saved.' })
    setStatus('idle')
  }

  const handleDeleteGoal = async () => {
    if (!confirm('Delete this activation goal?')) return
    const token = await getToken()
    try {
      const res = await fetch(`${apiUrl}/activation-goal`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setMessage({ type: 'error', text: (data as { error?: string }).error ?? 'Failed to delete goal.' })
        return
      }
      setGoal(null)
      setEventName('')
      setDescription('')
      setMessage({ type: 'success', text: 'Goal deleted.' })
    } catch {
      setMessage({ type: 'error', text: 'Network error — could not delete goal.' })
    }
  }

  return (
    <div className="cog-page max-w-[560px]">
      <PageHeader
        eyebrow="Activation Goal"
        title="Define success"
        description="Cognity uses this to know when a user has truly gotten started — and to celebrate with them."
      />

      {!isLoaded || status === 'loading' ? (
        <LoadingDots label={status === 'loading' ? 'Loading goal…' : 'Authenticating…'} />
      ) : !isSignedIn ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to configure your activation goal.</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 animate-fade-up">
          {goal && (
            <div
              className="flex items-start gap-2.5 rounded-2xl px-5 py-4"
              style={{ background: 'var(--mist)', border: '1px solid rgba(124,58,237,0.16)' }}
            >
              <Target className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--purple)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium" style={{ color: 'var(--void)' }}>
                  Current goal:{' '}
                  <span className="font-mono" style={{ color: 'var(--purple)' }}>{goal.event_name}</span>
                  <span className="ml-2 font-normal" style={{ color: 'var(--text-muted)' }}>
                    · saved {new Date(goal.created_at).toLocaleDateString()}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={handleDeleteGoal}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#dc2626', fontSize: '12px', display: 'flex',
                    alignItems: 'center', gap: '4px', marginTop: '8px', padding: 0,
                  }}
                >
                  <Trash2 size={13} /> Delete goal
                </button>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="event_name" className="mb-2 flex items-baseline gap-2 text-[13px] font-semibold"
                   style={{ color: 'rgba(14,11,26,0.75)' }}>
              Event name
              <span className="text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>
                e.g. bot_created, workflow_published
              </span>
            </label>
            <input
              id="event_name"
              value={eventName}
              onChange={e => setEventName(e.target.value)}
              placeholder="bot_created"
              className="cog-input font-mono"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 flex items-baseline gap-2 text-[13px] font-semibold"
                   style={{ color: 'rgba(14,11,26,0.75)' }}>
              Description
              <span className="text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>
                plain English — what did the user just do?
              </span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="User created their first bot and reached the first success moment."
              rows={4}
              className="cog-input resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button type="submit" disabled={status === 'saving'} className="cog-btn-primary">
              {status === 'saving' ? 'Saving…' : 'Save goal'}
            </button>
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
          </div>
        </form>
      )}
    </div>
  )
}
