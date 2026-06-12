import Link from 'next/link'
import {
  MessageSquare, BarChart2, Zap, BookOpen,
  ArrowRight, Check, ChevronRight
} from 'lucide-react'

export const metadata = {
  title: 'Cognity — AI Onboarding for SaaS',
  description: 'Replace static product tours with real conversations. Guide every user to their first success moment automatically.',
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const features = [
  {
    icon: MessageSquare,
    title: 'Conversational onboarding',
    body: 'A chat widget that asks each user what they want to achieve, then guides them step by step using your own documentation.',
  },
  {
    icon: Zap,
    title: 'Stuck-user detection',
    body: 'After 45 seconds of inactivity, Cognity sends a contextual nudge — personalised to the user\'s stated goal and current page.',
  },
  {
    icon: BookOpen,
    title: 'RAG-powered answers',
    body: 'Upload your help docs once. Cognity embeds them and retrieves the most relevant chunks for every response. No hallucinations about your product.',
  },
  {
    icon: BarChart2,
    title: 'Activation analytics',
    body: 'See total sessions, activated users, and activation rate at a glance. Drill into exactly which pages lose the most users.',
  },
]

const steps: { n: string; title: string; body: string; code?: string }[] = [
  {
    n: '01',
    title: 'Sign up and upload your docs',
    body: 'Create your account, paste your product documentation or upload a file. Cognity embeds it in under a minute.',
  },
  {
    n: '02',
    title: 'Define your activation event',
    body: 'Tell Cognity what "success" looks like — e.g. bot_created or first_report_sent. It will steer every user toward that moment.',
  },
  {
    n: '03',
    title: 'Paste one line of code',
    body: 'Drop a single script tag into your product. No npm install, no build step, no framework dependency.',
    code: `<script src="https://cdn.cognity.ai/widget.js" data-id="YOUR_APP_ID" async></script>`,
  },
  {
    n: '04',
    title: 'Watch activation rates climb',
    body: 'Users start getting guided conversations from day one. Track activation in your dashboard and iterate on your docs.',
  },
]

const testimonials = [
  {
    quote: 'We went from a 12-step written guide to a 3-minute conversation. Users who chat with Cognity activate at 2× the rate.',
    name: 'Sarah K.',
    role: 'Founder, workflow automation SaaS',
  },
  {
    quote: 'Setup was literally one line of code. Within a week I could see exactly which page was killing my trial conversions.',
    name: 'Marcus T.',
    role: 'CTO, B2B analytics platform',
  },
  {
    quote: 'Our support tickets dropped 30% in the first month. Users just… figure it out now, because they have someone to ask.',
    name: 'Priya M.',
    role: 'Head of Product, developer tools startup',
  },
]

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Free',
    sub: 'Forever',
    features: ['500 sessions / month', '1 documentation source', 'Basic analytics', 'Email support'],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$49',
    sub: 'per month',
    features: ['5,000 sessions / month', 'Unlimited documentation', 'Full analytics + stuck pages', 'Custom activation goals', 'Priority support'],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Scale',
    price: '$149',
    sub: 'per month',
    features: ['Unlimited sessions', 'Unlimited documentation', 'Advanced analytics + exports', 'Multiple products', 'Slack support'],
    cta: 'Talk to us',
    highlighted: false,
  },
]

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper font-sans">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-ink/06 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-1.5">
            <span className="text-[18px] font-bold tracking-tight text-ink">Cognity</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-lead/60 mt-0.5">beta</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-ink/50">
            <a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a>
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/sign-in" className="text-[13px] font-medium text-ink/60 hover:text-ink transition-colors">
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="cog-btn-primary text-[13px] px-4 py-2"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-lead/20 bg-lead/06 px-3.5 py-1.5 text-[12px] font-semibold text-lead mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-lead animate-pulse-dot" />
          Now in beta — free for the first 50 teams
        </div>

        <h1 className="text-[52px] font-bold tracking-tight text-ink leading-[1.1] max-w-3xl mx-auto">
          Stop losing users before
          <br />
          <span className="text-lead">they see the value.</span>
        </h1>

        <p className="mt-6 text-[18px] text-ink/50 max-w-xl mx-auto leading-relaxed">
          Cognity replaces static product tours with real AI conversations that guide each user to their first success moment automatically.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth/sign-up"
            className="cog-btn-primary text-[15px] px-7 py-3.5 gap-2"
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="cog-btn-ghost text-[15px] px-7 py-3.5"
          >
            See how it works
          </a>
        </div>

        <p className="mt-4 text-[12px] text-ink/30">No credit card required · Setup in under 5 minutes</p>

        {/* Hero visual — mock chat widget */}
        <div className="mt-16 mx-auto max-w-sm">
          <div className="rounded-2xl border border-ink/08 bg-white shadow-card-hover overflow-hidden text-left">
            {/* Widget header */}
            <div className="bg-ink px-4 py-3.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-lead flex items-center justify-center shrink-0">
                <MessageSquare className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white leading-none">Cognity</p>
                <p className="text-[11px] text-white/40 mt-0.5">Your onboarding assistant</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-400" />
            </div>
            {/* Messages */}
            <div className="px-4 py-4 space-y-3 bg-paper/50">
              <ChatBubble role="assistant" text="Welcome! What are you trying to achieve today?" />
              <ChatBubble role="user" text="I want to connect my Slack workspace" />
              <ChatBubble role="assistant" text="Got it! Head to Settings → Integrations → Slack. Click 'Connect workspace' and sign in with your Slack admin account. Takes about 30 seconds." />
            </div>
            {/* Input */}
            <div className="border-t border-ink/06 px-4 py-3 flex gap-2 bg-white">
              <div className="flex-1 rounded-full bg-paper border border-ink/08 px-3.5 py-2 text-[12px] text-ink/30">
                Type a message…
              </div>
              <div className="w-8 h-8 rounded-full bg-lead flex items-center justify-center shrink-0">
                <ArrowRight className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>
          {/* Floating bubble */}
          <div className="flex justify-end mt-3 mr-1">
            <div className="w-12 h-12 rounded-full bg-lead shadow-card-hover flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof strip — infinite marquee ────────────────────────── */}
      <section className="border-y border-ink/06 bg-white py-7 overflow-hidden">
        <p className="text-center text-[12px] font-medium text-ink/30 uppercase tracking-widest mb-6">
          Trusted by early-stage SaaS teams
        </p>

        {/* Inline keyframe so it works regardless of Tailwind JIT scanning */}
        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            display: flex;
            width: max-content;
            animation: marquee 28s linear infinite;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
          .marquee-group {
            display: flex;
            align-items: center;
            gap: 4rem;
            padding-right: 4rem;
            flex-shrink: 0;
          }
        `}</style>

        <div
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          }}
        >
          <div className="marquee-track">
            <div className="marquee-group">
              {[
                'Workflow.io', 'DataPulse', 'Formly', 'Stackr', 'Pipeloop',
                'NovaCRM', 'Chartwell', 'Loopbase',
              ].map((name, i) => (
                <span
                  key={i}
                  className="text-[15px] font-bold text-ink/25 tracking-tight whitespace-nowrap select-none"
                >
                  {name}
                </span>
              ))}
            </div>
            <div className="marquee-group" aria-hidden="true">
              {[
                'Workflow.io', 'DataPulse', 'Formly', 'Stackr', 'Pipeloop',
                'NovaCRM', 'Chartwell', 'Loopbase',
              ].map((name, i) => (
                <span
                  key={i}
                  className="text-[15px] font-bold text-ink/25 tracking-tight whitespace-nowrap select-none"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="cog-eyebrow mb-4">The problem</p>
        <h2 className="text-[36px] font-bold text-ink tracking-tight leading-tight">
          Most users churn before they
          <br />ever see your product work.
        </h2>
        <p className="mt-5 text-[16px] text-ink/50 max-w-2xl mx-auto leading-relaxed">
          Generic product tours get skipped. Help docs don't get read. Users hit one confusing step, give up, and never come back. You lose them before they ever understand why your product is worth keeping.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-3 text-left">
          {[
            { stat: '~60%', label: 'of SaaS trials never reach the activation moment' },
            { stat: '< 3 min', label: 'average time users spend before abandoning setup' },
            { stat: '5×', label: 'cheaper to activate a trial than acquire a new one' },
          ].map(({ stat, label }) => (
            <div key={stat} className="cog-card px-6 py-5">
              <p className="text-[36px] font-bold text-lead leading-none">{stat}</p>
              <p className="mt-2 text-[13px] text-ink/50 leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-ink py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-lead mb-3">How it works</p>
            <h2 className="text-[36px] font-bold text-white tracking-tight">Live in under 5 minutes.</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {steps.map((step) => (
              <div key={step.n} className="flex gap-5">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-lead/15 flex items-center justify-center">
                  <span className="text-[12px] font-bold font-mono text-lead">{step.n}</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-white mb-1.5">{step.title}</h3>
                  <p className="text-[14px] text-white/40 leading-relaxed">{step.body}</p>
                  {step.code && (
                    <pre className="mt-3 rounded-lg bg-white/05 border border-white/08 px-4 py-3 text-[12px] font-mono text-lead/80 overflow-x-auto">
                      {step.code}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-5xl px-6 py-24">
        <div className="text-center mb-16">
          <p className="cog-eyebrow mb-3">Features</p>
          <h2 className="text-[36px] font-bold text-ink tracking-tight">Everything you need to activate users.</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="cog-card p-7 group hover:shadow-card-hover transition-shadow duration-200">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-lead/08 text-lead group-hover:bg-lead group-hover:text-white transition-colors duration-200">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h3 className="text-[15px] font-semibold text-ink mb-1.5">{title}</h3>
              <p className="text-[13px] text-ink/50 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-ink/06 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <p className="cog-eyebrow mb-3">What teams are saying</p>
            <h2 className="text-[32px] font-bold text-ink tracking-tight">Real results from real teams.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map(({ quote, name, role }) => (
              <div key={name} className="rounded-xl border border-ink/08 p-6">
                <p className="text-[14px] text-ink/70 leading-relaxed mb-5">"{quote}"</p>
                <div>
                  <p className="text-[13px] font-semibold text-ink">{name}</p>
                  <p className="text-[12px] text-ink/40">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-5xl px-6 py-24">
        <div className="text-center mb-14">
          <p className="cog-eyebrow mb-3">Pricing</p>
          <h2 className="text-[36px] font-bold text-ink tracking-tight">Simple, predictable pricing.</h2>
          <p className="mt-3 text-[15px] text-ink/50">Start free. Scale when you're ready.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={[
                'rounded-xl p-7 flex flex-col',
                plan.highlighted
                  ? 'bg-ink text-white ring-2 ring-lead'
                  : 'cog-card',
              ].join(' ')}
            >
              <p className={`text-[11px] font-semibold uppercase tracking-widest mb-3 ${plan.highlighted ? 'text-lead' : 'text-ink/40'}`}>
                {plan.name}
              </p>
              <div className="mb-1">
                <span className={`text-[40px] font-bold tracking-tight leading-none ${plan.highlighted ? 'text-white' : 'text-ink'}`}>
                  {plan.price}
                </span>
                <span className={`ml-1.5 text-[13px] ${plan.highlighted ? 'text-white/40' : 'text-ink/40'}`}>
                  {plan.sub}
                </span>
              </div>

              <ul className="mt-6 mb-8 space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]">
                    <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlighted ? 'text-lead' : 'text-lead'}`} strokeWidth={2.5} />
                    <span className={plan.highlighted ? 'text-white/70' : 'text-ink/60'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/sign-up"
                className={[
                  'w-full text-center rounded-lg px-5 py-2.5 text-[13px] font-semibold transition-all duration-150',
                  plan.highlighted
                    ? 'bg-lead text-white hover:bg-lead/90'
                    : 'border border-ink/12 text-ink/70 hover:border-ink/20 hover:text-ink bg-white',
                ].join(' ')}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-ink py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-[40px] font-bold text-white tracking-tight leading-tight">
            Your users deserve a better
            <br />first experience.
          </h2>
          <p className="mt-5 text-[16px] text-white/40 leading-relaxed max-w-xl mx-auto">
            Join the teams using Cognity to turn confused trial users into activated, paying customers.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/sign-up"
              className="cog-btn-primary text-[15px] px-8 py-3.5"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/sign-in"
              className="text-[14px] font-medium text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
            >
              Already have an account <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-ink/06 bg-paper py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-bold text-ink">Cognity</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-lead/60">v1</span>
          </div>
          <p className="text-[12px] text-ink/30">© {new Date().getFullYear()} Cognity. Built for SaaS teams who care about activation.</p>
          <div className="flex gap-5 text-[12px] font-medium text-ink/40">
            <Link href="/auth/sign-in" className="hover:text-ink transition-colors">Sign in</Link>
            <Link href="/auth/sign-up" className="hover:text-ink transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}

/* ─── Chat bubble component ──────────────────────────────────────────────── */
function ChatBubble({ role, text }: { role: 'user' | 'assistant'; text: string }) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[85%] rounded-xl px-3.5 py-2.5 text-[12px] leading-relaxed',
          role === 'user'
            ? 'bg-lead text-white rounded-br-sm'
            : 'bg-white border border-ink/08 text-ink/80 rounded-bl-sm shadow-card',
        ].join(' ')}
      >
        {text}
      </div>
    </div>
  )
}
