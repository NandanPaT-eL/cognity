'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[dashboard error]', error)
  }, [error])

  return (
    <div
      style={{
        padding:    '80px 40px',
        textAlign:  'center',
        maxWidth:   '480px',
        margin:     '0 auto',
      }}
    >
      <div
        style={{
          width:          '48px',
          height:         '48px',
          borderRadius:   '50%',
          background:     'rgba(220,38,38,0.10)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          margin:         '0 auto 20px',
          fontSize:       '22px',
        }}
      >
        ⚠
      </div>
      <p
        style={{
          fontSize:      '18px',
          fontWeight:    700,
          color:         'var(--void)',
          marginBottom:  '8px',
          letterSpacing: '-0.02em',
        }}
      >
        Something went wrong
      </p>
      <p
        style={{
          fontSize:     '14px',
          color:        'var(--text-soft)',
          marginBottom: '28px',
          lineHeight:   1.6,
        }}
      >
        An unexpected error occurred. Try refreshing, or contact support if the problem persists.
      </p>
      <button
        onClick={reset}
        style={{
          padding:      '10px 28px',
          borderRadius: '50px',
          background:   'var(--purple)',
          color:        '#fff',
          fontSize:     '14px',
          fontWeight:   600,
          border:       'none',
          cursor:       'pointer',
          boxShadow:    '0 4px 12px rgba(124,58,237,0.30)',
        }}
      >
        Try again
      </button>
    </div>
  )
}
