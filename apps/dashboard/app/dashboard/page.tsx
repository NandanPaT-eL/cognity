'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { BarChart2, BookOpen, Target, ArrowRight, Zap, Users, TrendingUp } from 'lucide-react'
import { UpgradeModal } from '@/components/upgrade-modal'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

interface UsageData {
  month:         string
  plan:          string
  trigger_count: number
  mau_count:     number
  limits: {
    monthly_triggers: number
    mau:              number
    documents:        number
  }
}

function UsageBar({
  label,
  icon: Icon,
  used,
  limit,
  onUpgrade,
}: {
  label:     string
  icon:      React.ElementType
  used:      number
  limit:     number
  onUpgrade: () => void
}) {
  // Unlimited plan (limit === -1) — show a special state
  if (limit === -1) {
    return (
      <div
        className="flex-1 rounded-2xl p-5"
        style={{ border: '1px solid rgba(14,11,26,0.08)', background: 'var(--canvas)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" style={{ color: 'var(--purple)' }} strokeWidth={1.8} />
            <span className="text-[13px] font-semibold" style={{ color: 'var(--void)' }}>{label}</span>
          </div>
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>Unlimited</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--mist)' }}>
          <div className="h-full rounded-full" style={{ width: '100%', background: 'var(--purple)', opacity: 0.3 }} />
        </div>
        <p className="mt-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
          {used.toLocaleString()} used
        </p>
      </div>
    )
  }

  // Zero limit (free/beta plan) — show locked state
  if (limit === 0) {
    return (
      <div
        className="flex-1 rounded-2xl p-5"
        style={{ border: '1px solid rgba(14,11,26,0.08)', background: 'var(--canvas)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" style={{ color: 'var(--text-muted)' }} strokeWidth={1.8} />
            <span className="text-[13px] font-semibold" style={{ color: 'var(--void)' }}>{label}</span>
          </div>
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>Not included</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--mist)' }}>
          <div className="h-full rounded-full" style={{ width: '0%', background: 'rgba(14,11,26,0.15)' }} />
        </div>
        <button
          onClick={onUpgrade}
          className="mt-3 text-[12px] font-semibold underline underline-offset-2"
          style={{ color: 'var(--purple)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Upgrade to unlock →
        </button>
      </div>
    )
  }

  const pct     = Math.min(100, Math.round((used / limit) * 100))
  const isWarn  = pct >= 80
  const barColor = pct >= 100 ? '#dc2626' : isWarn ? '#d97706' : 'var(--purple)'

  return (
    <div
      className="flex-1 rounded-2xl p-5"
      style={{
        border:     isWarn ? `1px solid ${pct >= 100 ? 'rgba(220,38,38,0.25)' : 'rgba(217,119,6,0.25)'}` : '1px solid rgba(14,11,26,0.08)',
        background: 'var(--canvas)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" strokeWidth={1.8} style={{ color: barColor }} />
          <span className="text-[13px] font-semibold" style={{ color: 'var(--void)' }}>{label}</span>
        </div>
        <span className="text-[12px] font-bold tabular-nums" style={{ color: barColor }}>
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--mist)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          {used.toLocaleString()} / {limit.toLocaleString()}
        </p>
        {isWarn && (
          <button
            onClick={onUpgrade}
            className="text-[11px] font-bold underline underline-offset-2"
            style={{ color: barColor, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Upgrade →
          </button>
        )}
      </div>
    </div>
  )
}

const sections = [
  {
    href:        '/dashboard/analytics',
    icon:        BarChart2,
    title:       'Analytics',
    description: 'Sessions, activation rate, and the exact pages where users drop off.',
  },
  {
    href:        '/dashboard/docs',
    icon:        BookOpen,
    title:       'Documentation',
    description: 'Upload your product docs so Cognity can guide users accurately.',
  },
  {
    href:        '/dashboard/goals',
    icon:        Target,
    title:       'Activation Goal',
    description: 'Define the one event that marks a user as successfully onboarded.',
  },
]

export default function DashboardPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [usage, setUsage]                  = useState<UsageData | null>(null)
  const [showUpgrade, setShowUpgrade]      = useState(false)
  const [checkoutSynced, setCheckoutSynced] = useState(false)
  const [checkoutSyncError, setCheckoutSyncError] = useState<string | null>(null)
  const searchParams                       = useSearchParams()
  const checkoutStatus                     = searchParams.get('checkout') // 'success' | 'cancelled' | null
  const sessionId                          = searchParams.get('session_id')

  const loadUsage = async () => {
    const token = await getToken()
    const res   = await fetch(`${apiUrl}/org/usage`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (res.ok) setUsage(await res.json())
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    loadUsage().catch(() => {})
  }, [getToken, isLoaded, isSignedIn])

  // Link Stripe payment → Cognity account immediately after redirect (webhook fallback).
  useEffect(() => {
    if (!isLoaded || !isSignedIn || checkoutStatus !== 'success' || !sessionId || checkoutSynced) return

    const confirm = async () => {
      try {
        const token = await getToken()
        const res   = await fetch(`${apiUrl}/billing/checkout/confirm`, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ session_id: sessionId }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { error?: string }
          throw new Error(data.error ?? 'Could not confirm payment')
        }
        setCheckoutSynced(true)
        await loadUsage()
      } catch (err) {
        setCheckoutSyncError(err instanceof Error ? err.message : 'Could not link payment to your account')
      }
    }

    confirm().catch(() => {})
  }, [checkoutStatus, checkoutSynced, getToken, isLoaded, isSignedIn, sessionId])

  const triggerPct = usage && usage.limits.monthly_triggers > 0
    ? (usage.trigger_count / usage.limits.monthly_triggers) * 100
    : 0
  const mauPct = usage && usage.limits.mau > 0
    ? (usage.mau_count / usage.limits.mau) * 100
    : 0
  const showUpgradeCta = triggerPct >= 80 || mauPct >= 80

  return (
    <div className="cog-page max-w-[900px]">

      {/* Header */}
      <div className="mb-10">
        <p className="cog-eyebrow mb-3">Dashboard</p>
        <h1 className="text-[30px] font-extrabold tracking-[-0.03em] leading-tight"
            style={{ color: 'var(--void)' }}>
          Good to see you.
        </h1>
        <p className="mt-3 text-[15px] max-w-md leading-relaxed" style={{ color: 'var(--text-soft)' }}>
          Configure your onboarding assistant, train it on your docs, and watch activation rates improve.
        </p>
      </div>

      {checkoutStatus === 'success' && (
        <div
          className="mb-6 rounded-2xl px-5 py-4 flex items-center gap-3"
          style={{
            background: checkoutSyncError
              ? 'rgba(220,38,38,0.08)'
              : 'rgba(22,163,74,0.08)',
            border: checkoutSyncError
              ? '1px solid rgba(220,38,38,0.25)'
              : '1px solid rgba(22,163,74,0.25)',
          }}
        >
          <span style={{ fontSize: '18px' }}>{checkoutSyncError ? '!' : '✓'}</span>
          <div>
            <p style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 700,
              color: checkoutSyncError ? '#b91c1c' : '#15803d',
            }}>
              {checkoutSyncError
                ? 'Payment received — account link pending'
                : checkoutSynced || !sessionId
                  ? 'Payment successful — your plan is active!'
                  : 'Payment successful — linking to your account…'}
            </p>
            <p style={{
              margin: '2px 0 0',
              fontSize: '13px',
              color: checkoutSyncError ? '#991b1b' : '#166534',
            }}>
              {checkoutSyncError
                ? checkoutSyncError
                : checkoutSynced || !sessionId
                  ? 'Your limits have been updated for this account.'
                  : 'This usually takes a few seconds.'}
            </p>
          </div>
        </div>
      )}

      {checkoutStatus === 'cancelled' && (
        <div
          className="mb-6 rounded-2xl px-5 py-4 flex items-center gap-3"
          style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)' }}
        >
          <span style={{ fontSize: '18px' }}>ℹ</span>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#92400e' }}>
              Checkout cancelled — no charge was made.
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#92400e' }}>
              You can upgrade any time from the usage panel below.
            </p>
          </div>
        </div>
      )}

      {/* ── Usage panel ──────────────────────────────────────────────────── */}
      {usage && (
        <div
          className="mb-8 rounded-2xl p-6"
          style={{ border: '1px solid rgba(14,11,26,0.08)', background: 'var(--canvas)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" style={{ color: 'var(--purple)' }} strokeWidth={1.8} />
              <p className="text-[14px] font-bold" style={{ color: 'var(--void)' }}>
                Usage &mdash; {usage.month}
              </p>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(124,58,237,0.10)',
                  color:      'var(--purple)',
                }}
              >
                {usage.plan}
              </span>
            </div>
            <button
              id="dashboard-billing-portal"
              onClick={() => setShowUpgrade(true)}
              className="text-[12px] font-semibold"
              style={{ color: 'var(--purple)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Manage plan →
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <UsageBar
              label="AI Triggers"
              icon={Zap}
              used={usage.trigger_count}
              limit={usage.limits.monthly_triggers}
              onUpgrade={() => setShowUpgrade(true)}
            />
            <UsageBar
              label="Monthly Active Users"
              icon={Users}
              used={usage.mau_count}
              limit={usage.limits.mau}
              onUpgrade={() => setShowUpgrade(true)}
            />
          </div>
        </div>
      )}

      {/* ── Upgrade CTA — shown when >80% of either limit used ───────────── */}
      {showUpgradeCta && (
        <div
          className="mb-8 rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-4"
          style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)' }}
        >
          <div>
            <p className="text-[14px] font-bold" style={{ color: 'var(--void)' }}>
              You&apos;re approaching your plan limits
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-soft)' }}>
              Upgrade now to keep your onboarding running smoothly.
            </p>
          </div>
          <button
            id="dashboard-upgrade-cta"
            onClick={() => setShowUpgrade(true)}
            className="cog-btn-primary shrink-0 !py-2.5 !px-5 !text-[13px] gap-1.5"
          >
            Upgrade plan
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Go-live banner */}
      <div
        className="mb-8 rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-4"
        style={{ background: 'var(--mist)', border: '1px solid rgba(124,58,237,0.16)' }}
      >
        <div>
          <p className="text-[14px] font-bold" style={{ color: 'var(--void)' }}>Ready to go live?</p>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-soft)' }}>
            Grab your install snippet and paste it into your product.
          </p>
        </div>
        <Link href="/dashboard/install" className="cog-btn-primary shrink-0 !py-2.5 !px-5 !text-[13px] gap-1.5">
          Get snippet
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Section cards — CSS-only hover via .cog-overview-card */}
      <div className="grid gap-4 md:grid-cols-3">
        {sections.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="cog-overview-card p-6">
            <div className="cog-overview-icon mb-5 h-10 w-10">
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
            </div>
            <h2 className="text-[15px] font-bold" style={{ color: 'var(--void)' }}>{title}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: 'var(--text-soft)' }}>
              {description}
            </p>
            <div className="cog-overview-arrow mt-5 text-[13px] font-semibold">
              Open
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Upgrade modal */}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}
