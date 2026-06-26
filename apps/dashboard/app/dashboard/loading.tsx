export default function DashboardLoading() {
  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '60vh',
        flexDirection:  'column',
        gap:            '12px',
      }}
    >
      <div
        style={{
          width:        '32px',
          height:       '32px',
          borderRadius: '50%',
          border:       '2.5px solid rgba(124,58,237,0.15)',
          borderTop:    '2.5px solid #7C3AED',
          animation:    'cognity-spin 0.7s linear infinite',
        }}
      />
      <style>{`
        @keyframes cognity-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
