import Link from 'next/link'
import { BarChart2, BookOpen, Target } from 'lucide-react'

const sections = [
  {
    href: '/dashboard/analytics',
    icon: BarChart2,
    title: 'Analytics',
    description: 'Track total sessions, activation rate, and the exact pages where users get stuck.',
  },
  {
    href: '/dashboard/docs',
    icon: BookOpen,
    title: 'Documentation',
    description: 'Upload your product docs so Cognity can guide users with accurate, contextual answers.',
  },
  {
    href: '/dashboard/goals',
    icon: Target,
    title: 'Activation Goal',
    description: 'Define the one event that marks a user as successfully onboarded.',
  },
]

export default function DashboardPage() {
  return (
    <main className="p-10">
      <div className="max-w-4xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-lead mb-2">
            Cognity Dashboard
          </p>
          <h1 className="text-[32px] font-bold text-ink leading-tight tracking-tight">
            Good to see you.
          </h1>
          <p className="mt-2 text-[15px] text-ink/50 max-w-md">
            Configure your onboarding assistant, upload documentation, and watch activation rates climb.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {sections.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="group relative rounded-xl border border-ink/08 bg-white p-6 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-lead/08 text-lead transition-colors group-hover:bg-lead group-hover:text-white">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
              <p className="mt-1.5 text-[13px] leading-6 text-ink/50">{description}</p>
              <span className="absolute bottom-6 right-6 text-ink/20 transition-colors group-hover:text-lead text-lg leading-none">→</span>
            </Link>
          ))}
        </div>

        {/* Quick-start strip */}
        <div className="mt-8 rounded-xl border border-ink/08 bg-white px-6 py-4 shadow-card flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-ink">Ready to go live?</p>
            <p className="text-[12px] text-ink/50 mt-0.5">Grab your one-line install snippet and paste it into your product.</p>
          </div>
          <Link
            href="/dashboard/install"
            className="shrink-0 rounded-lg bg-lead px-4 py-2 text-[13px] font-semibold text-white hover:bg-lead/90 transition-colors"
          >
            Get snippet →
          </Link>
        </div>
      </div>
    </main>
  )
}