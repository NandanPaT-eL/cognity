"use client"

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, BarChart2, BookOpen, Target, Code, Settings, Map } from 'lucide-react'

const navItems = [
  { href: '/dashboard',           label: 'Overview',        icon: LayoutDashboard, exact: true  },
  { href: '/dashboard/analytics', label: 'Analytics',       icon: BarChart2,       exact: false },
  { href: '/dashboard/docs',      label: 'Documentation',   icon: BookOpen,        exact: false },
  { href: '/dashboard/tours',     label: 'Tours',           icon: Map,             exact: false },
  { href: '/dashboard/goals',     label: 'Activation Goal', icon: Target,          exact: false },
  { href: '/dashboard/install',   label: 'Install',         icon: Code,            exact: false },
  { href: '/dashboard/settings',  label: 'Settings',        icon: Settings,        exact: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--mist)' }}>

      {/* ── Sidebar — fixed, full height ──────────────────────────────── */}
      <aside
        className="fixed inset-y-0 left-0 z-30 w-[232px] flex flex-col"
        style={{ background: 'var(--void)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link
            href="/"
            className="flex items-center gap-2 text-[20px] font-bold tracking-[-0.03em] text-white hover:text-white/80 transition-colors"
          >
            <Image src="/logo.png" alt="Cognity logo" width={32} height={32} className="object-contain" />
            <div className="flex items-start gap-1.5">
              <span>cognity</span>
              <span className="rounded-[4px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white mt-0.5" style={{ background: 'var(--purple)' }}>Beta</span>
            </div>
          </Link>
        </div>

        {/* Workspace label */}
        <p className="px-6 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.14em]"
           style={{ color: 'rgba(255,255,255,0.25)' }}>
          Workspace
        </p>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-150',
                  isActive
                    ? 'text-white'
                    : 'hover:text-white/90',
                ].join(' ')}
                style={isActive
                  ? { background: 'rgba(124,58,237,0.35)', color: '#fff', boxShadow: '0 2px 8px rgba(124,58,237,0.20)' }
                  : { color: 'rgba(255,255,255,0.45)' }
                }
              >
                <Icon
                  className="h-[15px] w-[15px] shrink-0"
                  strokeWidth={isActive ? 2.2 : 1.7}
                  style={{ color: isActive ? '#C4B5FD' : 'inherit' }}
                />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <UserButton
            appearance={{
              elements: {
                userButtonBox:             'flex items-center gap-2.5',
                userButtonOuterIdentifier: 'text-[12px] font-medium text-white/50',
                userButtonAvatarBox:       'w-7 h-7',
              },
            }}
            showName
          />
        </div>
      </aside>

      {/* ── Main — offset by sidebar width ────────────────────────────── */}
      <main className="flex-1 ml-[232px] min-h-screen" style={{ background: 'var(--canvas)' }}>
        <div className="animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  )
}
