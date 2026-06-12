"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, BarChart2, BookOpen, Target, Code } from 'lucide-react'

const navItems = [
  { href: '/dashboard',            label: 'Overview',         icon: LayoutDashboard, exact: true },
  { href: '/dashboard/analytics',  label: 'Analytics',        icon: BarChart2,       exact: false },
  { href: '/dashboard/docs',       label: 'Documentation',    icon: BookOpen,        exact: false },
  { href: '/dashboard/goals',      label: 'Activation Goal',  icon: Target,          exact: false },
  { href: '/dashboard/install',    label: 'Install',          icon: Code,            exact: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-paper">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 flex flex-col bg-ink">

        {/* Wordmark */}
        <div className="px-6 pt-7 pb-6">
          <span className="text-[22px] font-bold tracking-tight text-white">
            Cognity
          </span>
          <span className="ml-1.5 text-[11px] font-medium text-white/30 uppercase tracking-widest align-middle">
            v1
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-lead text-white'
                    : 'text-white/50 hover:bg-white/08 hover:text-white',
                ].join(' ')}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.5 : 1.8} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/08 px-4 py-4">
          <UserButton
            appearance={{
              elements: {
                userButtonBox:               'flex items-center gap-2.5',
                userButtonOuterIdentifier:   'text-[13px] font-medium text-white/70',
                userButtonAvatarBox:         'w-7 h-7',
              },
            }}
            showName
          />
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 animate-fade-up">
        {children}
      </div>
    </div>
  )
}