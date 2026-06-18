import Link from 'next/link'
import { BarChart2, BookOpen, Target, ArrowRight } from 'lucide-react'

const sections = [
  {
    href: '/dashboard/analytics',
    icon: BarChart2,
    title: 'Analytics',
    description: 'Sessions, activation rate, and the exact pages where users drop off.',
  },
  {
    href: '/dashboard/docs',
    icon: BookOpen,
    title: 'Documentation',
    description: 'Upload your product docs so Cognity can guide users accurately.',
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
    </div>
  )
}
