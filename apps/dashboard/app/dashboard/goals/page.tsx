"use client"

import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '@clerk/nextjs'
import { CheckCircle, AlertCircle, Target } from 'lucide-react'

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

  return (
    <main className="p-10">
      <div className="max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-lead mb-2">Activation Goal</p>
          <h1 className="text-[28px] font-bold text-ink tracking-tight">Define success</h1>
          <p className="mt-1 text-[14px] text-ink/50">
            Cognity uses this to know when a user has truly gotten started — and to celebrate with them.
          </p>
        </div>

        {!isLoaded || status === 'loading' ? (
          <LoadingDots label={status === 'loading' ? 'Loading goal…' : 'Authenticating…'} />
        ) : !isSignedIn ? (
          <p className="text-[14px] text-ink/40">Sign in to configure your activation goal.</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-5 animate-fade-up">

            {/* Current goal badge */}
            {goal && (
              <div className="flex items-center gap-2 rounded-lg bg-lead/08 border border-lead/20 px-4 py-3">
                <Target className="h-4 w-4 text-lead shrink-0" />
                <p className="text-[12px] text-lead font-medium">
                  Current goal: <span className="font-mono">{goal.event_name}</span>
                  <span className="text-lead/60 font-normal ml-2">
                    · saved {new Date(goal.created_at).toLocaleDateString()}
                  </span>
                </p>
              </div>
            )}

            {/* Event name */}
            <div>
              <label htmlFor="event_name" className="mb-1.5 block text-[13px] font-medium text-ink">
                Event name
                <span className="ml-2 text-[11px] font-normal text-ink/40">e.g. bot_created, workflow_published</span>
              </label>
              <input
                id="event_name"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                placeholder="bot_created"
                className="cog-input font-mono"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="mb-1.5 block text-[13px] font-medium text-ink">
                Description
                <span className="ml-2 text-[11px] font-normal text-ink/40">plain English — what did the user just do?</span>
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

            {/* Submit */}
            <div className="flex items-center gap-4 pt-1">
              <button
                type="submit"
                disabled={status === 'saving'}
                className="cog-btn-primary"
              >
                {status === 'saving' ? 'Saving…' : 'Save goal'}
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