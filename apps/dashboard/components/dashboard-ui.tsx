"use client"


interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="mb-10">
      <p className="cog-eyebrow mb-2">{eyebrow}</p>
      <h1
        className="text-[28px] font-bold tracking-[-0.03em] leading-tight"
        style={{ color: 'var(--void)' }}
      >
        {title}
      </h1>
      <p className="mt-2 text-[15px] max-w-lg leading-relaxed" style={{ color: 'var(--text-soft)' }}>
        {description}
      </p>
    </div>
  )
}

export function LoadingDots({ label }: { label: string }) {
  return (
    <div className="cog-loading">
      <span className="cog-loading-dot" />
      <span className="cog-loading-dot" />
      <span className="cog-loading-dot" />
      {label}
    </div>
  )
}

export function EmptyState({ label }: { label: string }) {
  return (
    <p className="text-sm py-8" style={{ color: 'var(--text-muted)' }}>
      {label}
    </p>
  )
}

export function DashboardCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`cog-card rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 flex items-baseline gap-2 text-[13px] font-semibold"
        style={{ color: 'rgba(14,11,26,0.75)' }}
      >
        {label}
        {hint && <span className="text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl px-5 py-4"
      style={{
        background: 'var(--mist)',
        border: '1px solid rgba(124,58,237,0.14)',
      }}
    >
      {children}
    </div>
  )
}

export function IconBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-xl p-2.5 transition-all duration-150"
      style={{
        color: 'var(--text-soft)',
        background: 'var(--canvas)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.color = 'var(--purple)'
        ;(e.currentTarget as HTMLElement).style.background = 'var(--mist)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.25)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.color = 'var(--text-soft)'
        ;(e.currentTarget as HTMLElement).style.background = 'var(--canvas)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
      }}
      aria-label={label}
    >
      {children}
    </button>
  )
}
