"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { DashboardCard, EmptyState, LoadingDots, PageHeader } from '@/components/dashboard-ui'

type AnalyticsOverview = {
  total_sessions:     number
  activated_sessions: number
  activation_rate:    number
  top_stuck_pages:    Array<{ page_path: string | null; idle_count: number }>
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

// ── Skeleton ─────────────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div
      className="rounded-2xl"
      style={{
        height:     '110px',
        background: 'rgba(14,11,26,0.06)',
        borderRadius: '16px',
        animation:  'cog-pulse 1.6s ease-in-out infinite',
      }}
    />
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
      <div
        style={{
          height:       '280px',
          borderRadius: '16px',
          background:   'rgba(14,11,26,0.06)',
          animation:    'cog-pulse 1.6s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes cog-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>
    </div>
  )
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs border shadow-md"
      style={{ background: 'var(--canvas)', borderColor: 'var(--border-mid)' }}
    >
      <p className="mb-0.5 truncate max-w-[200px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="font-semibold" style={{ color: 'var(--void)' }}>{payload[0].value} idle events</p>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  highlight = false,
}: {
  label:      string
  value:      string
  highlight?: boolean
}) {
  return (
    <div className="cog-card cog-card-hover rounded-2xl p-6">
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p
        className="text-[32px] font-extrabold tracking-tight leading-none tabular-nums"
        style={{ color: highlight ? 'var(--purple)' : 'var(--void)' }}
      >
        {value}
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [data,    setData]    = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    const load = async () => {
      try {
        const token = await getToken()
        const res   = await fetch(`${apiUrl}/analytics/overview`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (!res.ok) {
          setFetchError(true)
        } else {
          setData((await res.json()) as AnalyticsOverview)
        }
      } catch {
        setFetchError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getToken, isLoaded, isSignedIn])

  const chartData = data?.top_stuck_pages.map((p) => ({
    name:  p.page_path ?? 'unknown',
    idles: p.idle_count,
  })) ?? []

  return (
    <div className="cog-page max-w-4xl">
      <PageHeader
        eyebrow="Analytics"
        title="Activation overview"
        description="See how many users succeed and exactly where they get stuck."
      />

      {/* ── Auth states ── */}
      {!isLoaded ? (
        <LoadingDots label="Authenticating…" />
      ) : !isSignedIn ? (
        <EmptyState label="Sign in to view analytics." />

      /* ── Loading skeleton ── */
      ) : loading ? (
        <AnalyticsSkeleton />

      /* ── Fetch error ── */
      ) : fetchError ? (
        <div
          style={{
            padding:      '24px',
            borderRadius: '16px',
            background:   'rgba(220,38,38,0.05)',
            border:       '1px solid rgba(220,38,38,0.18)',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#dc2626' }}>
            Could not load analytics. Try refreshing.
          </p>
        </div>

      /* ── No data (zero sessions) ── */
      ) : data && data.total_sessions === 0 ? (
        <div
          style={{
            padding:      '32px',
            borderRadius: '16px',
            border:       '1px solid rgba(14,11,26,0.08)',
            background:   'var(--canvas)',
            textAlign:    'center',
          }}
        >
          <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 600, color: 'var(--void)' }}>
            No sessions yet.
          </p>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--text-soft)', lineHeight: 1.6 }}>
            Install the snippet and your first data will appear here.
          </p>
          <Link
            href="/dashboard/install"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            '6px',
              padding:        '10px 20px',
              borderRadius:   '50px',
              background:     'var(--purple)',
              color:          '#fff',
              fontSize:       '14px',
              fontWeight:     600,
              textDecoration: 'none',
            }}
          >
            Get the snippet →
          </Link>
        </div>

      /* ── Data view ── */
      ) : data ? (
        <div className="space-y-5 animate-fade-up">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total sessions"     value={data.total_sessions.toString()} />
            <StatCard label="Activated sessions" value={data.activated_sessions.toString()} />
            <StatCard label="Activation rate"    value={`${Math.round(data.activation_rate * 100)}%`} highlight />
          </div>

          <DashboardCard>
            <h2 className="text-[15px] font-bold mb-0.5" style={{ color: 'var(--void)' }}>Top stuck pages</h2>
            <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
              Pages where users spent 45+ seconds without acting.
            </p>
            {chartData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="40%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,11,26,0.06)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: 'rgba(14,11,26,0.35)', fontFamily: 'JetBrains Mono, monospace' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: 'rgba(14,11,26,0.35)' }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
                    <Bar dataKey="idles" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState label="No idle events recorded yet." />
            )}
          </DashboardCard>
        </div>
      ) : null}
    </div>
  )
}
