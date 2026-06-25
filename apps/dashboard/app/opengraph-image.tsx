import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Cognity — AI Onboarding for SaaS'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          background: '#0F172A',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Purple glow top-right */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
          }}
        />

        {/* Beta badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(124,58,237,0.20)',
            border: '1px solid rgba(124,58,237,0.40)',
            borderRadius: 9999,
            padding: '6px 16px',
            marginBottom: 32,
          }}
        >
          <span style={{ color: '#A78BFA', fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Beta · cognity.com.au
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            maxWidth: 780,
          }}
        >
          Turn every signup into an activated user.
        </div>

        {/* Subtext */}
        <div
          style={{
            marginTop: 28,
            fontSize: 24,
            color: 'rgba(255,255,255,0.50)',
            maxWidth: 620,
            lineHeight: 1.5,
          }}
        >
          AI onboarding that replaces static tours with real conversations.
        </div>

        {/* Bottom wordmark */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>C</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.70)', fontSize: 22, fontWeight: 700 }}>
            cognity.com.au
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
