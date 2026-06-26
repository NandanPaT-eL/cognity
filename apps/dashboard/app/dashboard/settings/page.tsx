'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Save, Plus, X, ExternalLink, RefreshCw } from 'lucide-react'
import { DashboardCard, PageHeader, LoadingDots } from '@/components/dashboard-ui'
import { UpgradeModal } from '@/components/upgrade-modal'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

type OrgInfo = {
  id:              string
  name:            string
  plan:            string
  api_key:         string
  allowed_origins: string[]
}

export default function SettingsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  const [org,         setOrg]         = useState<OrgInfo | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)

  // Org name
  const [orgName,     setOrgName]     = useState('')
  const [nameSaving,  setNameSaving]  = useState(false)
  const [nameMsg,     setNameMsg]     = useState<{ ok: boolean; text: string } | null>(null)

  // Origins
  const [origins,     setOrigins]     = useState<string[]>([])
  const [newOrigin,   setNewOrigin]   = useState('')
  const [originSaving, setOriginSaving] = useState(false)
  const [originMsg,   setOriginMsg]   = useState<{ ok: boolean; text: string } | null>(null)

  // Billing portal
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError,   setPortalError]   = useState<string | null>(null)

  // ── Load org info ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    const load = async () => {
      try {
        const token = await getToken()
        const res   = await fetch(`${apiUrl}/org/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json() as OrgInfo
          setOrg(data)
          setOrgName(data.name)
          setOrigins(data.allowed_origins ?? [])
        }
      } finally {
        setLoading(false)
      }
    }
    load().catch(() => setLoading(false))
  }, [getToken, isLoaded, isSignedIn])

  // ── Save org name ──────────────────────────────────────────────────────
  const saveName = async () => {
    if (!orgName.trim()) return
    setNameSaving(true)
    setNameMsg(null)
    try {
      const token = await getToken()
      const res   = await fetch(`${apiUrl}/org/me`, {
        method:  'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: orgName.trim() }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const updated = await res.json() as OrgInfo
      setOrg((prev) => prev ? { ...prev, name: updated.name } : prev)
      setNameMsg({ ok: true, text: 'Name saved.' })
    } catch {
      setNameMsg({ ok: false, text: 'Could not save name. Please try again.' })
    } finally {
      setNameSaving(false)
    }
  }

  // ── Add origin ─────────────────────────────────────────────────────────
  const addOrigin = async () => {
    const raw = newOrigin.trim()
    if (!raw || origins.includes(raw)) return
    setOriginSaving(true)
    setOriginMsg(null)
    try {
      const token = await getToken()
      const res   = await fetch(`${apiUrl}/org/origins`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ add: [raw], remove: [] }),
      })
      if (!res.ok) throw new Error('Failed to add')
      const data = await res.json() as { allowed_origins: string[] }
      setOrigins(data.allowed_origins)
      setNewOrigin('')
      setOriginMsg({ ok: true, text: 'Origin added.' })
    } catch {
      setOriginMsg({ ok: false, text: 'Could not add origin. Make sure it is a valid URL.' })
    } finally {
      setOriginSaving(false)
    }
  }

  // ── Remove origin ──────────────────────────────────────────────────────
  const removeOrigin = async (origin: string) => {
    setOriginSaving(true)
    setOriginMsg(null)
    try {
      const token = await getToken()
      const res   = await fetch(`${apiUrl}/org/origins`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ add: [], remove: [origin] }),
      })
      if (!res.ok) throw new Error('Failed to remove')
      const data = await res.json() as { allowed_origins: string[] }
      setOrigins(data.allowed_origins)
    } catch {
      setOriginMsg({ ok: false, text: 'Could not remove origin.' })
    } finally {
      setOriginSaving(false)
    }
  }

  // ── Billing portal ─────────────────────────────────────────────────────
  const openPortal = async () => {
    setPortalLoading(true)
    setPortalError(null)
    try {
      const token = await getToken()
      const res   = await fetch(`${apiUrl}/billing/portal`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.status === 400) {
        // No Stripe customer yet — show upgrade modal instead
        setShowUpgrade(true)
        setPortalLoading(false)
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? 'Failed to open billing portal')
      }
      const { url } = await res.json() as { url: string }
      window.location.href = url
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : 'Something went wrong.')
      setPortalLoading(false)
    }
  }

  // ────────────────────────────────────────────────────────────────────────

  if (!isLoaded || loading) {
    return (
      <div className="cog-page max-w-2xl">
        <LoadingDots label="Loading settings…" />
      </div>
    )
  }

  if (!isSignedIn || !org) {
    return (
      <div className="cog-page max-w-2xl">
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Sign in to view settings.
        </p>
      </div>
    )
  }

  return (
    <div className="cog-page max-w-2xl">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Manage your organisation name, SDK origins, API key, and billing."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Org name ── */}
        <DashboardCard>
          <h2 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--void)' }}>
            Organisation name
          </h2>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Shown in emails and on your dashboard.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id="settings-org-name"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="My Organisation"
              style={{
                flex:         1,
                height:       '40px',
                padding:      '0 12px',
                borderRadius: '12px',
                border:       '1.5px solid rgba(14,11,26,0.12)',
                fontSize:     '14px',
                color:        'var(--void)',
                background:   'var(--canvas)',
                outline:      'none',
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') saveName() }}
            />
            <button
              id="settings-save-name"
              onClick={saveName}
              disabled={nameSaving}
              style={{
                height:         '40px',
                padding:        '0 16px',
                borderRadius:   '12px',
                background:     'var(--purple)',
                color:          '#fff',
                fontSize:       '13px',
                fontWeight:     600,
                border:         'none',
                cursor:         nameSaving ? 'not-allowed' : 'pointer',
                opacity:        nameSaving ? 0.6 : 1,
                display:        'flex',
                alignItems:     'center',
                gap:            '6px',
              }}
            >
              <Save className="h-3.5 w-3.5" />
              {nameSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
          {nameMsg && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: nameMsg.ok ? '#16a34a' : '#dc2626' }}>
              {nameMsg.text}
            </p>
          )}
        </DashboardCard>

        {/* ── Allowed SDK origins ── */}
        <DashboardCard>
          <h2 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--void)' }}>
            Allowed SDK origins
          </h2>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Only requests from these origins will be accepted by the SDK. Leave empty to allow all.
          </p>

          {/* Current origins list */}
          {origins.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              {origins.map((o) => (
                <div
                  key={o}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                    padding:        '8px 12px',
                    borderRadius:   '10px',
                    background:     'var(--mist)',
                    border:         '1px solid rgba(14,11,26,0.07)',
                  }}
                >
                  <span style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--void)' }}>{o}</span>
                  <button
                    aria-label={`Remove ${o}`}
                    onClick={() => removeOrigin(o)}
                    disabled={originSaving}
                    style={{
                      background: 'none',
                      border:     'none',
                      cursor:     'pointer',
                      color:      'var(--text-muted)',
                      padding:    '2px',
                      display:    'flex',
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add origin */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id="settings-new-origin"
              type="url"
              value={newOrigin}
              onChange={(e) => setNewOrigin(e.target.value)}
              placeholder="https://app.example.com"
              style={{
                flex:         1,
                height:       '40px',
                padding:      '0 12px',
                borderRadius: '12px',
                border:       '1.5px solid rgba(14,11,26,0.12)',
                fontSize:     '14px',
                color:        'var(--void)',
                background:   'var(--canvas)',
                outline:      'none',
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') addOrigin() }}
            />
            <button
              id="settings-add-origin"
              onClick={addOrigin}
              disabled={originSaving || !newOrigin.trim()}
              style={{
                height:       '40px',
                padding:      '0 14px',
                borderRadius: '12px',
                background:   'var(--mist)',
                color:        'var(--void)',
                fontSize:     '13px',
                fontWeight:   600,
                border:       '1.5px solid rgba(14,11,26,0.12)',
                cursor:       originSaving ? 'not-allowed' : 'pointer',
                display:      'flex',
                alignItems:   'center',
                gap:          '5px',
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
          {originMsg && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: originMsg.ok ? '#16a34a' : '#dc2626' }}>
              {originMsg.text}
            </p>
          )}
        </DashboardCard>

        {/* ── Billing ── */}
        <DashboardCard>
          <h2 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--void)' }}>
            Billing
          </h2>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Current plan: <strong style={{ color: 'var(--purple)' }}>{org.plan}</strong>
          </p>
          <button
            id="settings-manage-billing"
            onClick={openPortal}
            disabled={portalLoading}
            style={{
              height:       '40px',
              padding:      '0 18px',
              borderRadius: '12px',
              background:   'var(--void)',
              color:        '#fff',
              fontSize:     '13px',
              fontWeight:   600,
              border:       'none',
              cursor:       portalLoading ? 'not-allowed' : 'pointer',
              opacity:      portalLoading ? 0.65 : 1,
              display:      'inline-flex',
              alignItems:   'center',
              gap:          '7px',
            }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {portalLoading ? 'Opening…' : 'Manage subscription'}
          </button>
          {portalError && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#dc2626' }}>{portalError}</p>
          )}
        </DashboardCard>

        {/* ── Danger zone ── */}
        <DashboardCard>
          <h2 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#dc2626' }}>
            Danger zone
          </h2>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Rotating your API key will immediately break any existing SDK installation.
          </p>
          <button
            id="settings-rotate-key"
            onClick={() => router.push('/dashboard/install')}
            style={{
              height:       '40px',
              padding:      '0 18px',
              borderRadius: '12px',
              background:   'rgba(220,38,38,0.06)',
              color:        '#dc2626',
              fontSize:     '13px',
              fontWeight:   600,
              border:       '1.5px solid rgba(220,38,38,0.25)',
              cursor:       'pointer',
              display:      'inline-flex',
              alignItems:   'center',
              gap:          '7px',
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Rotate API key
          </button>
        </DashboardCard>

      </div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}
