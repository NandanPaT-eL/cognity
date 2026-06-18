"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { DashboardCard, EmptyState, LoadingDots, PageHeader } from '@/components/dashboard-ui'

type AnalyticsOverview = {
  total_sessions: number
  activated_sessions: number
  activation_rate: number
  top_stuck_pages: Array<{ page_path: string | null; idle_count: number }>
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs border shadow-md"
         style={{ background: 'var(--canvas)', borderColor: 'var(--border-mid)' }}>
      <p className="mb-0.5 truncate max-w-[200px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="font-semibold" style={{ color: 'var(--void)' }}>{payload[0].value} idle events</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    const load = async () => {
      const token = await getToken()
      const res = await fetch(`${apiUrl}/analytics/overview`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (res.ok) setData((await res.json()) as AnalyticsOverview)
      setLoading(false)
    }
    load().catch(() => setLoading(false))
  }, [getToken, isLoaded, isSignedIn])

  const chartData = data?.top_stuck_pages.map(p => ({
    name: p.page_path ?? 'unknown',
    idles: p.idle_count
  })) ?? []

  return (
    <div className="cog-page max-w-4xl">
      <PageHeader
        eyebrow="Analytics"
        title="Activation overview"
        description="See how many users succeed and exactly where they get stuck."
      />

      {!isLoaded ? (
        <LoadingDots label="Authenticating…" />
      ) : !isSignedIn ? (
        <EmptyState label="Sign in to view analytics." />
      ) : loading ? (
        <LoadingDots label="Fetching data…" />
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
      ) : (
        <EmptyState label="No analytics data yet." />
      )}
    </div>
  )
}

function StatCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
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
