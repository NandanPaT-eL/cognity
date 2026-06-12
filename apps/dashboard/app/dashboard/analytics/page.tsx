"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'

type AnalyticsOverview = {
  total_sessions: number
  activated_sessions: number
  activation_rate: number
  top_stuck_pages: Array<{ page_path: string | null; idle_count: number }>
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

/* ── Custom tooltip ─────────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-ink/08 bg-white px-3 py-2 shadow-card text-[12px]">
      <p className="text-ink/50 mb-0.5 truncate max-w-[200px]">{label}</p>
      <p className="font-semibold text-ink">{payload[0].value} idle events</p>
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
    <main className="p-10">
      <div className="max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-lead mb-2">Analytics</p>
          <h1 className="text-[28px] font-bold text-ink tracking-tight">Activation overview</h1>
          <p className="mt-1 text-[14px] text-ink/50">See how many users succeed and exactly where they get stuck.</p>
        </div>

        {!isLoaded ? (
          <LoadingState label="Authenticating…" />
        ) : !isSignedIn ? (
          <EmptyState label="Sign in to view analytics." />
        ) : loading ? (
          <LoadingState label="Fetching data…" />
        ) : data ? (
          <div className="space-y-6 animate-fade-up">

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Total sessions"     value={data.total_sessions.toString()} />
              <StatCard label="Activated sessions" value={data.activated_sessions.toString()} />
              <StatCard
                label="Activation rate"
                value={`${Math.round(data.activation_rate * 100)}%`}
                accent
              />
            </div>

            {/* Stuck pages chart */}
            <div className="rounded-xl border border-ink/08 bg-white p-6 shadow-card">
              <h2 className="text-[15px] font-semibold text-ink mb-1">Top stuck pages</h2>
              <p className="text-[12px] text-ink/40 mb-6">Pages where users spent 45+ seconds without acting.</p>
              {chartData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barCategoryGap="40%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,13,13,0.06)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: 'rgba(13,13,13,0.4)', fontFamily: 'var(--font-mono)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: 'rgba(13,13,13,0.4)' }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
                      <Bar dataKey="idles" fill="#2563EB" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState label="No idle events recorded yet." />
              )}
            </div>
          </div>
        ) : (
          <EmptyState label="No analytics data yet." />
        )}
      </div>
    </main>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-ink/08 bg-white p-6 shadow-card">
      <p className="text-[12px] font-medium text-ink/40 uppercase tracking-wide">{label}</p>
      <p className={`mt-2 text-[36px] font-bold tracking-tight leading-none ${accent ? 'text-lead' : 'text-ink'}`}>
        {value}
      </p>
    </div>
  )
}

function LoadingState({ label }: { label: string }) {
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

function EmptyState({ label }: { label: string }) {
  return (
    <p className="text-[14px] text-ink/40 py-8">{label}</p>
  )
}