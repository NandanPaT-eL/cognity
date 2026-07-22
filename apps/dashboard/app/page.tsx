'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import {
  ArrowRight, Check, X, MessageSquare, Zap, BarChart2,
  BookOpen, Code2, Target, Sparkles, Clock, Users,
} from 'lucide-react'
import { ChatDemo } from '@/components/landing/chat-demo'
import { CookieBanner } from '@/components/cookie-banner'



const logos = ['Workflow.io', 'DataPulse', 'Formly', 'Stackr', 'Pipeloop', 'NovaCRM']

const bento = [
  {
    icon: Target,
    title: 'Intent-aware onboarding',
    body: 'Cognity AI agent captures user intent and helps them achieve their goal.',
    className: 'md:col-span-2 md:row-span-1',
    large: true,
  },
  {
    icon: Zap,
    title: 'Stuck-user detection',
    body: 'Detects when users are struggling and proactively guides them before they drop off.',
    className: 'md:col-span-1',
    large: false,
  },
  {
    icon: Sparkles,
    title: 'Milestone celebrations',
    body: 'Celebrates key achievements to keep users progressing toward value.',
    className: 'md:col-span-1',
    large: false,
  },
  {
    icon: MessageSquare,
    title: 'Ongoing guidance',
    body: 'Provides in-product guidance throughout the user journey, automatically resolving up to 93% of support questions.',
    className: 'md:col-span-1',
    large: false,
  },
  {
    icon: BarChart2,
    title: 'Activation analytics',
    body: 'Track activation, time-to-value, drop-offs, and onboarding performance in one place.',
    className: 'md:col-span-1',
    large: false,
  },
]

const comparison = {
  old: ['Users struggle to find value and churn', 'Every user is forced through the same generic onboarding experience, regardless of their goals', 'Friction goes unnoticed until users leave', 'Support tickets increase as users get stuck', 'Activation, retention, and conversion suffer', 'Weeks to set up with engineering'],
  new: ['Users are guided to their first success based on their goals', 'Every onboarding journey starts with user intent and is personalised', 'Friction is detected in under 45 seconds and addressed in real time', 'Users reach value faster with less support', 'More signups become activated, successful users', 'No code required. Live in minutes.'],
}

const workflow = [
  { icon: BookOpen, label: 'Upload docs',       desc: 'Paste or upload your product documentation' },
  { icon: Target,   label: 'Set activation goal', desc: 'One event name defines success' },
  { icon: Code2,    label: 'Paste snippet',      desc: 'Single script tag in your app' },
]

const faqs = [
  { q: 'How is this different from Intercom or a chatbot?', a: 'Cognity is purpose-built for onboarding — not support. It knows your docs, tracks activation goals, and detects when users are stuck on a specific page.' },
  { q: 'Do I need engineering to set this up?', a: 'No. Upload your docs in the dashboard, paste one script tag, and you\'re live. Most teams are running in under five minutes.' },
  { q: 'What counts as an "activation goal"?', a: 'Any event you already track — bot_created, workspace_connected, first_export. Cognity steers every conversation toward that moment.' },
  { q: 'Can I use my existing help documentation?', a: 'Yes. Upload PDFs, markdown, HTML, or paste text directly. Cognity chunks and embeds it automatically.' },
]

const pricingPlans = [
  {
    name: 'Starter',
    subtitle: 'For early-stage SaaS teams',
    price: '$39',
    period: 'AUD / mo',
    planKey: 'starter',
    features: [
      '1,000 intent captures / month',
      '2,000 stuck-user detections / month',
      '5,000 MAU tracked / month',
      '2,000 triggers / month',
      '3 team members · 3 integrations',
      'Ongoing guidance · basic analytics',
      'Cognity branding',
    ],
    cta: 'Subscribe to Starter',
    highlighted: false,
  },
  {
    name: 'Growth',
    subtitle: 'For growing teams scaling their product',
    price: '$99',
    period: 'AUD / mo',
    planKey: 'growth',
    features: [
      '5,000 intent captures / month',
      '10,000 stuck-user detections / month',
      '25,000 MAU tracked / month',
      '10,000 triggers / month',
      '10 team members · unlimited integrations',
      'Advanced analytics · your branding',
      'Micro surveys',
    ],
    cta: 'Subscribe to Growth',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    subtitle: 'Custom limits, SSO, and dedicated support for larger teams.',
    price: 'Custom',
    period: '',
    planKey: null,
    features: [
      'Unlimited usage tiers',
      'Custom integrations & SLAs',
      'Dedicated onboarding support',
    ],
    cta: 'Contact us',
    highlighted: false,
  },
]

export default function LandingPage() {
  const { isSignedIn, getToken } = useAuth()
  const [buyingPlan, setBuyingPlan] = useState<string | null>(null)
  const [buyError, setBuyError] = useState<string | null>(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

  const handlePlanClick = async (planKey: string | null) => {
    if (!planKey) return // Enterprise - handled by link
    setBuyingPlan(planKey)
    setBuyError(null)
    if (!isSignedIn) {
      window.location.href = `/auth/sign-up?redirect=/dashboard`
      return
    }
    try {
      const token = await getToken()
      const res = await fetch(`${apiUrl}/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan: planKey }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Failed to start checkout')
      }
      const { url } = await res.json() as { url: string }
      window.location.href = url
    } catch (err) {
      setBuyError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBuyingPlan(null)
    }
  }

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: 'var(--canvas)' }}>

      {/* ── Top Banner ──────────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 z-[60] py-2.5 text-center text-[13px] font-medium" style={{ background: 'var(--purple)', color: '#fff' }}>
        <button
          onClick={() => handlePlanClick('lifetime')}
          disabled={buyingPlan === 'lifetime'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#fff', fontSize: '13px', fontWeight: 500,
            opacity: buyingPlan === 'lifetime' ? 0.7 : 1,
          }}
        >
          {buyingPlan === 'lifetime' ? 'Redirecting to checkout…' : '$75 AUD one-time · Beta only →'}
        </button>
      </div>

      {/* ── Floating nav ──────────────────────────────────────────────── */}
      <div className="fixed top-14 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <header
          className="pointer-events-auto flex items-center gap-1 rounded-full pl-5 pr-2 py-2 max-w-full"
          style={{
            border: '1px solid rgba(14,11,26,0.08)',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 2px 16px rgba(14,11,26,0.06)',
          }}
        >
          <Link href="/" className="flex items-center gap-2 text-[18px] font-bold tracking-[-0.03em] mr-4 shrink-0" style={{ color: 'var(--void)' }}>
            <Image src="/logo.png" alt="Cognity logo" width={36} height={36} className="object-contain" />
            <div className="flex items-start gap-1.5">
              <span>cognity</span>
              <span className="rounded-[4px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white mt-0.5" style={{ background: 'var(--purple)' }}>Beta</span>
            </div>
          </Link>
          <nav className="hidden sm:flex items-center">
            {[
              ['Product', '#product'],
              ['How it works', '#product'],
              ['Pricing', '#pricing'],
            ].map(([label, href]) => (
              <a key={label} href={href} className="cog-nav-link px-3 py-1.5 rounded-full">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1 ml-2 sm:ml-4">
            <Link href="/auth/sign-in" className="cog-nav-link px-3 py-1.5 rounded-full hidden sm:block">
              Sign in
            </Link>
            <Link href="/auth/sign-up" className="cog-btn-primary !py-2 !px-4 !text-[14px]">
              Get started
            </Link>
          </div>
        </header>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-36 lg:pb-28">
        {/* Purple radial gradient backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 65% 15%, rgba(124,58,237,0.10) 0%, transparent 65%)',
          }}
        />
        {/* Subtle grid */}
        <div aria-hidden className="absolute inset-0 pointer-events-none grid-bg opacity-40" />

        <div className="cog-container">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
            <div>
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-8"
                style={{
                  border: '1px solid rgba(124,58,237,0.25)',
                  background: 'rgba(124,58,237,0.07)',
                }}
              >
                <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--purple)' }} />
                <span className="text-[12px] font-semibold" style={{ color: '#000000' }}>
                  Beta — limited spots
                </span>
              </div>
              <p className="text-[12px] mt-1.5 leading-relaxed"
                 style={{ color: 'var(--text-muted)' }}>
                Grandfathered onto Growth plan after launch — no recurring fees ever.
              </p>

              <h1
                className="text-[44px] sm:text-[52px] lg:text-[56px] font-extrabold tracking-[-0.04em] leading-[1.04]"
                style={{ color: '#000000' }}
              >
                Turn every signup into an activated user.
              </h1>
              <p className="mt-6 text-[17px] leading-relaxed max-w-[480px]" style={{ color: '#000000' }}>
                Stop losing users before they see value with the first Al-powered activation platform that understands user intent and guides users to success.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/auth/sign-up" className="cog-btn-primary text-[15px] gap-2">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#product" className="cog-btn-ghost text-[14px]">
                  See how it works
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-8">
                {[
                  { icon: Clock,  label: 'Live in 3 min' },
                  { icon: Code2,  label: 'No code required' },
                  { icon: Users,  label: 'Built for SaaS Teams' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-[13px] font-medium" style={{ color: '#000000' }}>
                    <Icon className="h-4 w-4" style={{ color: 'var(--purple)' }} strokeWidth={1.8} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:pl-4">
              <ChatDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ── Logo strip ────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(14,11,26,0.06)', borderBottom: '1px solid rgba(14,11,26,0.06)' }} className="py-8">
        <div className="cog-container flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] w-full text-center sm:w-auto sm:text-left"
                style={{ color: '#000000' }}>
            Trusted by teams at
          </span>
          {logos.map(name => (
            <span key={name} className="text-[14px] font-bold tracking-tight" style={{ color: '#000000' }}>
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ── Bento product grid ────────────────────────────────────────── */}
      <section id="product" className="cog-container py-28">
        <div className="mb-14 max-w-xl">
          <span className="cog-eyebrow">Product</span>
          <h2 className="mt-3 text-[38px] font-extrabold tracking-[-0.035em] leading-[1.1]" style={{ color: 'var(--void)' }}>
            Built for activation,<br />not engagement theater.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {bento.map(({ icon: Icon, title, body, className, large }) => (
            <div
              key={title}
              className={`cog-bento-item rounded-[24px] p-8 ${className}`}
            >
              <div className={`cog-bento-icon mb-6 ${large ? 'h-12 w-12' : 'h-10 w-10'}`}>
                <Icon className={large ? 'h-5 w-5' : 'h-4 w-4'} strokeWidth={1.7} />
              </div>
              <h3 className={`font-bold mb-2 ${large ? 'text-[18px]' : 'text-[15px]'}`} style={{ color: 'var(--void)' }}>{title}</h3>
              <p className={`leading-relaxed ${large ? 'text-[15px]' : 'text-[14px]'}`} style={{ color: 'var(--text-soft)' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison ────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden" style={{ background: 'var(--void)' }}>
        <div aria-hidden className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        {/* Purple glow */}
        <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
             style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.20) 0%, transparent 70%)' }} />

        <div className="cog-container relative">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--purple)' }}>Why switch</span>
            <h2 className="mt-3 text-[36px] font-extrabold tracking-[-0.03em] text-white">
              The old way vs. Cognity
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            <div className="rounded-[24px] p-8" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-[12px] font-bold uppercase tracking-wider mb-6" style={{ color: 'rgba(255,255,255,0.28)' }}>Without Cognity</p>
              <ul className="space-y-4">
                {comparison.old.map(item => (
                  <li key={item} className="flex items-start gap-3 text-[14px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    <X className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.22)' }} strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[24px] p-8" style={{ border: '1px solid rgba(124,58,237,0.35)', background: 'rgba(124,58,237,0.10)' }}>
              <p className="text-[12px] font-bold uppercase tracking-wider mb-6" style={{ color: 'var(--lilac)' }}>With Cognity</p>
              <ul className="space-y-4">
                {comparison.new.map(item => (
                  <li key={item} className="flex items-start gap-3 text-[14px]" style={{ color: 'rgba(255,255,255,0.78)' }}>
                    <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#A78BFA' }} strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow timeline ──────────────────────────────────────────── */}
      <section id="workflow" className="cog-container py-28">
        <div className="text-center mb-16">
          <span className="cog-eyebrow">How it works</span>
          <h2 className="mt-3 text-[36px] font-extrabold tracking-[-0.03em]" style={{ color: 'var(--void)' }}>
            Three steps. Three minutes.
          </h2>
          <p className="mt-3 text-[15px]" style={{ color: 'var(--text-soft)' }}>Simple to install.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 relative">
          <div aria-hidden className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-px" style={{ background: 'rgba(124,58,237,0.15)' }} />
          {workflow.map(({ icon: Icon, label, desc }, i) => (
            <div key={label} className="relative text-center">
              <div
                className="mx-auto mb-5 w-14 h-14 rounded-2xl flex items-center justify-center relative z-10"
                style={{
                  background: 'var(--purple)',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.30)',
                }}
              >
                <Icon className="h-5 w-5 text-white" strokeWidth={1.7} />
              </div>
              <span className="text-[11px] font-bold font-mono" style={{ color: 'var(--purple)' }}>0{i + 1}</span>
              <h3 className="mt-1 text-[15px] font-bold" style={{ color: 'var(--void)' }}>{label}</h3>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--text-soft)' }}>{desc}</p>
            </div>
          ))}
        </div>

      </section>

      {/* ── Stats band ────────────────────────────────────────────────── */}
      <section className="py-16" style={{ borderTop: '1px solid rgba(14,11,26,0.06)', borderBottom: '1px solid rgba(14,11,26,0.06)', background: 'var(--mist)' }}>
        <div className="cog-container grid sm:grid-cols-3 gap-10 text-center">
          {[
            { stat: '2.4×', label: 'higher activation for users who chat' },
            { stat: '−30%', label: 'support tickets in the first month' },
            { stat: '<5 min', label: 'average time to go live' },
          ].map(({ stat, label }) => (
            <div key={stat}>
              <p className="text-[48px] font-extrabold tracking-[-0.04em] leading-none" style={{ color: 'var(--purple)' }}>{stat}</p>
              <p className="mt-3 text-[14px] max-w-[200px] mx-auto" style={{ color: 'var(--text-soft)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonial ───────────────────────────────────────────────── */}
      <section className="cog-container py-28">
        <div
          className="rounded-[32px] p-10 sm:p-14 relative overflow-hidden"
          style={{ background: 'var(--void)' }}
        >
          <div aria-hidden className="absolute top-0 right-0 w-80 h-80 opacity-25 pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.65) 0%, transparent 70%)',
          }} />
          <div className="relative max-w-2xl">
            <p className="text-[22px] sm:text-[26px] font-semibold text-white leading-[1.35] tracking-[-0.02em]">
              &ldquo;We replaced a 12-step written guide with Cognity in a morning. Users who chat with it activate at more than twice the rate of those who don&apos;t.&rdquo;
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.40)' }}
              >
                <span className="text-[13px] font-bold" style={{ color: '#C4B5FD' }}>S</span>
              </div>
              <div>
                <p className="text-[14px] font-bold text-white">Sarah K.</p>
                <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.40)' }}>Founder, workflow automation SaaS</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mt-5">
          {[
            { quote: 'Within a week I could see exactly which page was killing my trial conversions.', name: 'Marcus T.', role: 'CTO, B2B analytics' },
            { quote: 'Support tickets dropped 30% in the first month. Users just figure things out now.', name: 'Priya M.', role: 'Head of Product, dev tools' },
          ].map(({ quote, name, role }) => (
            <div key={name} className="rounded-2xl p-7" style={{ border: '1px solid rgba(14,11,26,0.08)' }}>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-soft)' }}>&ldquo;{quote}&rdquo;</p>
              <p className="mt-5 text-[13px] font-bold" style={{ color: 'var(--void)' }}>{name}</p>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-28" style={{ background: 'var(--mist)' }}>
        <div className="cog-container max-w-2xl">
          <h2 className="text-[32px] font-extrabold tracking-[-0.03em] mb-10 text-center" style={{ color: 'var(--void)' }}>
            Questions, answered.
          </h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(14,11,26,0.08)', background: 'var(--canvas)' }}
              >
                <summary
                  className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none text-[15px] font-semibold select-none [&::-webkit-details-marker]:hidden"
                  style={{ color: 'var(--void)' }}
                >
                  {q}
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[16px] leading-none group-open:rotate-45 transition-transform"
                    style={{ background: 'var(--mist)', color: 'var(--purple)' }}
                  >
                    +
                  </span>
                </summary>
                <div
                  className="px-6 pb-5 text-[14px] leading-relaxed pt-4"
                  style={{ borderTop: '1px solid rgba(14,11,26,0.06)', color: 'var(--text-soft)' }}
                >
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <section id="pricing" className="cog-container py-28">
        <div className="text-center mb-10">
          <span className="cog-eyebrow">Pricing</span>
          <h2 className="mt-3 text-[36px] font-extrabold tracking-[-0.03em]" style={{ color: 'var(--void)' }}>
            Simple, transparent pricing.
          </h2>
          <p className="mt-4 text-[15px] max-w-lg mx-auto" style={{ color: 'var(--text-soft)' }}>
            Beta teams can lock in the{' '}
            <button
              type="button"
              onClick={() => handlePlanClick('lifetime')}
              disabled={buyingPlan === 'lifetime'}
              className="font-semibold underline-offset-2 hover:underline"
              style={{ color: 'var(--purple)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              $75 AUD lifetime deal
            </button>
            {' '}— grandfathered onto Growth after launch.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {pricingPlans.map(plan => (
            <div
              key={plan.name}
              className="rounded-[24px] p-8 flex flex-col h-full"
              style={plan.highlighted
                ? {
                    background: 'var(--purple)',
                    boxShadow: '0 12px 40px rgba(124,58,237,0.28)',
                  }
                : {
                    border: '1px solid rgba(14,11,26,0.08)',
                    background: 'var(--canvas)',
                  }
              }
            >
              {plan.highlighted && (
                <span
                  className="self-start text-[10px] font-bold uppercase tracking-wider mb-4 px-2.5 py-1 rounded-full"
                  style={{ color: 'var(--purple)', background: '#fff' }}
                >
                  Most popular
                </span>
              )}
              <h3
                className="text-[22px] font-bold mb-2"
                style={{ color: plan.highlighted ? '#fff' : 'var(--void)' }}
              >
                {plan.name}
              </h3>
              <p
                className="text-[14px] leading-relaxed mb-6 min-h-[2.75rem]"
                style={{ color: plan.highlighted ? 'rgba(255,255,255,0.72)' : 'var(--text-soft)' }}
              >
                {plan.subtitle}
              </p>

              <div className="mb-6 flex items-baseline gap-1.5">
                <span
                  className="text-[36px] font-extrabold tracking-[-0.03em]"
                  style={{ color: plan.highlighted ? '#fff' : 'var(--void)' }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className="text-[13px] font-medium"
                    style={{ color: plan.highlighted ? 'rgba(255,255,255,0.65)' : 'var(--text-soft)' }}
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              <p
                className="text-[11px] font-bold uppercase tracking-wider mb-4"
                style={{ color: plan.highlighted ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)' }}
              >
                What&apos;s included
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]">
                    <Check
                      className="h-4 w-4 shrink-0 mt-0.5"
                      style={{ color: plan.highlighted ? '#DDD6FE' : 'var(--purple)' }}
                      strokeWidth={2.5}
                    />
                    <span style={{ color: plan.highlighted ? 'rgba(255,255,255,0.88)' : 'var(--text-soft)' }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.planKey ? (
                <button
                  onClick={() => handlePlanClick(plan.planKey)}
                  disabled={buyingPlan === plan.planKey}
                  className={`w-full flex justify-center text-center mt-auto ${plan.highlighted ? 'cog-plan-cta cog-plan-cta--dark' : 'cog-plan-cta cog-plan-cta--light'}`}
                  style={{ cursor: buyingPlan === plan.planKey ? 'not-allowed' : 'pointer', opacity: buyingPlan === plan.planKey ? 0.7 : 1, border: 'none' }}
                >
                  {buyingPlan === plan.planKey ? 'Redirecting…' : plan.cta}
                </button>
              ) : (
                <a
                  href="mailto:support@cognity.com.au"
                  className="w-full flex justify-center text-center mt-auto cog-plan-cta cog-plan-cta--light"
                >
                  {plan.cta}
                </a>
              )}
            </div>
          ))}
        </div>
        {buyError && (
          <p style={{ textAlign: 'center', color: '#dc2626', fontSize: '13px', marginTop: '16px' }}>
            {buyError}
          </p>
        )}
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="cog-container pb-28">
        <div
          className="rounded-[32px] p-12 sm:p-16 text-center relative overflow-hidden"
          style={{ border: '1px solid rgba(124,58,237,0.15)', background: 'var(--mist)' }}
        >
          <div aria-hidden className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 70%)' }}
          />
          <div className="relative">
            <h2
              className="text-[36px] sm:text-[42px] font-extrabold tracking-[-0.04em] leading-[1.08] max-w-lg mx-auto"
              style={{ color: 'var(--void)' }}
            >
              Stop losing users before they see value.
            </h2>
            <p className="mt-4 text-[16px] max-w-md mx-auto" style={{ color: 'var(--text-soft)' }}>
              Set up in minutes. No engineering sprint.
            </p>
            <Link href="/auth/sign-up" className="cog-btn-primary mt-8 text-[15px] gap-2 inline-flex">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(14,11,26,0.08)', background: 'var(--canvas)' }}>
        <div className="cog-container py-14 grid sm:grid-cols-4 gap-10">
          <div className="sm:col-span-1">
            <p className="text-[18px] font-bold tracking-[-0.03em]" style={{ color: 'var(--void)' }}>cognity</p>
            <p className="mt-3 text-[13px] max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              AI onboarding that guides every user to their first success moment.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Product</p>
            <div className="flex flex-col gap-2.5">
              {[['Product', '#product'], ['How it works', '#workflow'], ['Pricing', '#pricing']].map(([l, h]) => (
                <a key={l} href={h} className="cog-footer-link">{l}</a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Account</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/auth/sign-in" className="text-[14px] font-medium transition-colors"
                    style={{ color: 'var(--text-soft)' }}>Sign in</Link>
              <Link href="/auth/sign-up" className="text-[14px] font-medium transition-colors"
                    style={{ color: 'var(--text-soft)' }}>Sign up</Link>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Legal</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/privacy" className="text-[14px] font-medium transition-colors"
                    style={{ color: 'var(--text-soft)' }}>Privacy Policy</Link>
              <Link href="/terms" className="text-[14px] font-medium transition-colors"
                    style={{ color: 'var(--text-soft)' }}>Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="cog-container pb-8 flex flex-wrap items-center justify-between gap-4 text-[12px]" style={{ color: 'rgba(14,11,26,0.25)' }}>
          <span>© {new Date().getFullYear()} Cognity Pty Ltd &nbsp;·&nbsp; <a href="https://cognity.com.au" className="hover:underline">cognity.com.au</a></span>
          <span className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </span>
        </div>
      </footer>

      {/* Cookie / data notice banner — appears for first-time visitors */}
      <CookieBanner />
    </div>
  )
}
