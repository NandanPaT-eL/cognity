'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isSet = document.cookie.split(';').some((c) => c.trim().startsWith('cog_cookie_ok='))
    if (!isSet) setVisible(true)
  }, [])

  const dismiss = () => {
    document.cookie = 'cog_cookie_ok=1;max-age=31536000;path=/'
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      style={{
        position:     'fixed',
        bottom:       '20px',
        left:         '50%',
        transform:    'translateX(-50%)',
        zIndex:       9999,
        width:        'min(540px, calc(100vw - 32px))',
        background:   'var(--void)',
        border:       '1px solid rgba(255,255,255,0.10)',
        borderRadius: '16px',
        boxShadow:    '0 8px 40px rgba(0,0,0,0.40)',
        padding:      '14px 18px',
        display:      'flex',
        alignItems:   'center',
        gap:          '14px',
      }}
    >
      <p
        style={{
          flex:       1,
          margin:     0,
          fontSize:   '13px',
          lineHeight: 1.6,
          color:      'rgba(255,255,255,0.60)',
        }}
      >
        We use a single cookie to remember your preferences. By using Cognity you agree to
        our{' '}
        <Link
          href="/privacy"
          style={{ color: '#C4B5FD', textDecoration: 'underline', textUnderlineOffset: '3px' }}
        >
          Privacy Policy
        </Link>
        .
      </p>
      <button
        id="cookie-banner-ok"
        onClick={dismiss}
        style={{
          flexShrink:   0,
          background:   'var(--purple)',
          color:        '#fff',
          border:       'none',
          borderRadius: '50px',
          padding:      '8px 20px',
          fontSize:     '13px',
          fontWeight:   600,
          cursor:       'pointer',
          whiteSpace:   'nowrap',
        }}
      >
        OK
      </button>
    </div>
  )
}
