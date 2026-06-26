'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { ArrowRight, Check, X } from 'lucide-react'

type Plan = 'starter' | 'growth' | 'lifetime'

interface UpgradeModalProps {
  onClose: () => void
}

const PLANS: Array<{
  key: Plan
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  badge?: string
}> = [
  {
    key:         'starter',
    name:        'Starter',
    price:       '$39',
    period:      'AUD / mo',
    description: 'Solo builders and early-stage products',
    features:    ['2,000 triggers / mo', '5,000 MAU', '20 documents'],
  },
  {
    key:         'growth',
    name:        'Growth',
    price:       '$99',
    period:      'AUD / mo',
    description: 'Teams scaling activation and onboarding',
    features:    ['10,000 triggers / mo', '25,000 MAU', '100 documents', 'Custom branding'],
    highlighted: false,
  },
  {
    key:         'lifetime',
    name:        'Lifetime Deal',
    price:       '$75',
    period:      'one-time · beta only',
    description: 'Lock in Growth limits forever — limited to 50 teams',
    features:    ['10,000 triggers / mo', '25,000 MAU', '50 documents', 'Grandfathered onto Growth'],
    highlighted: true,
    badge:       'Best value',
  },
]

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  const { getToken } = useAuth()
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null)
  const [error, setError]             = useState<string | null>(null)

  const handleSelect = async (plan: Plan) => {
    setLoadingPlan(plan)
    setError(null)
    try {
      const token = await getToken()
      const res   = await fetch(`${apiUrl}/billing/checkout`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`)
      }
      const { url } = await res.json() as { url: string }
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoadingPlan(null)
    }
  }

  const isLoading = loadingPlan !== null

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position:       'fixed',
          inset:          0,
          background:     'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          zIndex:         998,
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        style={{
          position:     'fixed',
          top:          '50%',
          left:         '50%',
          transform:    'translate(-50%,-50%)',
          zIndex:       999,
          width:        'min(560px, calc(100vw - 32px))',
          maxHeight:    'calc(100vh - 32px)',
          overflowY:    'auto',
          background:   'var(--canvas)',
          borderRadius: '24px',
          boxShadow:    '0 24px 80px rgba(0,0,0,0.30)',
        }}
      >
        <div
          style={{
            background: 'var(--void)',
            padding:    '28px 28px 24px',
            position:   'relative',
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position:       'absolute',
              top:            '16px',
              right:          '16px',
              background:     'rgba(255,255,255,0.10)',
              border:         'none',
              borderRadius:   '50%',
              width:          '32px',
              height:         '32px',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         'pointer',
              color:          'rgba(255,255,255,0.55)',
            }}
          >
            <X className="h-4 w-4" />
          </button>

          <p
            id="upgrade-modal-title"
            style={{
              margin:        0,
              fontSize:      '20px',
              fontWeight:    700,
              color:         '#fff',
              letterSpacing: '-0.03em',
            }}
          >
            Choose a plan
          </p>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.5 }}>
            Unlock more triggers, MAU, and documents. Secure checkout via Stripe.
          </p>
        </div>

        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {PLANS.map((p) => {
            const selected = loadingPlan === p.key
            const dimmed   = isLoading && !selected

            return (
              <button
                key={p.key}
                id={`upgrade-modal-${p.key}`}
                disabled={isLoading}
                onClick={() => handleSelect(p.key)}
                style={{
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'stretch',
                  gap:            '14px',
                  padding:        '18px 20px',
                  borderRadius:   '18px',
                  border:         p.highlighted
                    ? '2px solid var(--purple)'
                    : '1.5px solid rgba(14,11,26,0.10)',
                  background:     p.highlighted
                    ? 'linear-gradient(180deg, rgba(124,58,237,0.08) 0%, rgba(124,58,237,0.03) 100%)'
                    : 'var(--canvas)',
                  cursor:         isLoading ? 'not-allowed' : 'pointer',
                  opacity:        dimmed ? 0.45 : 1,
                  textAlign:      'left',
                  transition:     'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
                  boxShadow:      p.highlighted ? '0 8px 24px rgba(124,58,237,0.12)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--void)',
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}>
                      {p.name}
                      {p.badge && (
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          background: 'var(--purple)',
                          color: '#fff',
                          borderRadius: '50px',
                          padding: '3px 8px',
                          letterSpacing: '0.02em',
                        }}>
                          {p.badge}
                        </span>
                      )}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                      {p.description}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--void)', letterSpacing: '-0.03em' }}>
                      {selected ? '…' : p.price}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {selected ? 'Redirecting' : p.period}
                    </p>
                  </div>
                </div>

                <ul style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '6px 12px',
                }}>
                  {p.features.map((feature) => (
                    <li
                      key={feature}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: 'var(--text-soft)',
                      }}
                    >
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--purple)' }} strokeWidth={2.5} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '4px',
                  borderTop: '1px solid rgba(14,11,26,0.06)',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: p.highlighted ? 'var(--purple)' : 'var(--void)' }}>
                    {selected ? 'Opening Stripe Checkout…' : 'Continue to checkout'}
                  </span>
                  <ArrowRight className="h-4 w-4" style={{ color: p.highlighted ? 'var(--purple)' : 'var(--text-muted)' }} />
                </div>
              </button>
            )
          })}

          {error && (
            <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', textAlign: 'center' }}>{error}</p>
          )}

          <p style={{ margin: '4px 0 0', fontSize: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Cancel subscriptions anytime from Settings → Manage subscription
          </p>
        </div>
      </div>
    </>
  )
}
