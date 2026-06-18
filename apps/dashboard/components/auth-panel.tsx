import Link from 'next/link'

type AuthPanelProps = {
  headline: React.ReactNode
  subtext: string
  children: React.ReactNode
}

export function AuthPanel({ headline, subtext, children }: AuthPanelProps) {
  return (
    <main className="flex min-h-screen">
      {/* Left — branding panel */}
      <div
        className="hidden lg:flex w-[440px] shrink-0 flex-col justify-between relative overflow-hidden"
        style={{ background: 'var(--void)' }}
      >
        {/* Subtle grid */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Purple glow blob */}
        <div
          aria-hidden
          className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
          }}
        />
        {/* Top purple accent line */}
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.8), transparent)' }}
        />

        {/* Logo */}
        <div className="relative px-12 pt-12">
          <Link href="/" className="text-[20px] font-bold tracking-[-0.03em] text-white">
            cognity
          </Link>
        </div>

        {/* Headline */}
        <div className="relative px-12 pb-4">
          <p className="text-[30px] font-bold text-white leading-[1.18] tracking-[-0.03em]">
            {headline}
          </p>
          <p className="mt-5 text-[15px] leading-relaxed max-w-[300px]" style={{ color: 'rgba(255,255,255,0.42)' }}>
            {subtext}
          </p>
        </div>

        {/* Footer */}
        <div className="relative px-12 pb-12">
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
            © {new Date().getFullYear()} Cognity
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div
        className="flex flex-1 items-center justify-center p-8"
        style={{ background: 'var(--canvas)' }}
      >
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <Link href="/" className="text-[20px] font-bold tracking-[-0.03em]" style={{ color: 'var(--void)' }}>
              cognity
            </Link>
          </div>
          {children}
        </div>
      </div>
    </main>
  )
}
