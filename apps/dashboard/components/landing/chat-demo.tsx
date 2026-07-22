"use client"

import { useEffect, useState } from 'react'
import { MessageSquare, Zap, Trophy, AlertCircle, MousePointer2 } from 'lucide-react'

// ─── Scene definitions ────────────────────────────────────────────────────────
// Each scene represents one moment in the Cognity experience

type Scene =
  | { type: 'suggestions' }
  | { type: 'chat';       userMsg: string; aiMsg: string }
  | { type: 'spotlight';  label: string; tooltip: string }
  | { type: 'stuck' }
  | { type: 'milestone';  time: string }

const scenes: Scene[] = [
  { type: 'suggestions' },
  { type: 'chat', userMsg: 'Create my first project', aiMsg: 'Great choice. I\'ll highlight the "New Project" button for you — it\'s the fastest path to getting started.' },
  { type: 'spotlight', label: '+ New Project', tooltip: 'Start here to create your first project and invite your team.' },
  { type: 'stuck' },
  { type: 'milestone', time: '4' },
]

const SCENE_DURATION = 3200

// ─── Mock SaaS sidebar ───────────────────────────────────────────────────────
function MockApp({ scene }: { scene: Scene }) {
  const isSpotlit = scene.type === 'spotlight'
  const isStuck   = scene.type === 'stuck'

  return (
    <div className="relative w-full h-full flex" style={{ background: '#f8f9fc', borderRadius: '12px', overflow: 'hidden', minHeight: 200 }}>
      {/* Sidebar */}
      <div className="w-[110px] shrink-0 flex flex-col gap-1 px-2 py-4" style={{ background: '#1a1a2e', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {['Dashboard', 'Projects', 'Campaigns', 'Analytics', 'Settings'].map((item, i) => (
          <div
            key={item}
            className="rounded-lg px-3 py-2 text-[10px] font-medium transition-all"
            style={{
              color: i === 1 ? '#fff' : 'rgba(255,255,255,0.38)',
              background: i === 1 ? 'rgba(124,58,237,0.35)' : 'transparent',
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold" style={{ color: '#1a1a2e' }}>Projects</p>

          {/* The highlighted button */}
          <div className="relative">
            <button
              className="rounded-lg px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 transition-all"
              style={{
                background: isSpotlit ? '#7C3AED' : '#e8e8f0',
                color: isSpotlit ? '#fff' : '#666',
                boxShadow: isSpotlit ? '0 0 0 4px rgba(124,58,237,0.25), 0 4px 16px rgba(124,58,237,0.4)' : 'none',
                transform: isSpotlit ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              + New Project
            </button>

            {/* Tooltip */}
            {isSpotlit && (
              <div
                className="absolute right-0 top-full mt-2 rounded-xl px-3 py-2 text-[10px] leading-relaxed whitespace-nowrap z-10"
                style={{
                  background: '#1a1a2e',
                  color: '#fff',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                  maxWidth: 200,
                  whiteSpace: 'normal',
                }}
              >
                <MousePointer2 className="h-3 w-3 inline mr-1 text-purple-400" />
                Start here to create your first project and invite your team.
              </div>
            )}
          </div>
        </div>

        {/* Empty state or placeholder rows */}
        {isStuck ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
              <AlertCircle className="h-4 w-4" style={{ color: '#d97706' }} />
            </div>
            <p className="text-[10px] text-center" style={{ color: '#888' }}>User has been on this page for 45s without acting…</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {['Design system audit', 'Q3 campaign launch'].map(name => (
              <div key={name} className="rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: '#fff', border: '1px solid rgba(14,11,26,0.07)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: '#7C3AED' }} />
                <span className="text-[10px]" style={{ color: '#444' }}>{name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overlay dim for spotlight */}
      {isSpotlit && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 12 }} />
      )}
      {/* Re-expose button area in spotlight */}
      {isSpotlit && (
        <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: 12, boxShadow: 'inset 0 0 0 0 transparent' }} />
      )}
    </div>
  )
}

// ─── Chat widget overlay ──────────────────────────────────────────────────────
function WidgetOverlay({ scene }: { scene: Scene }) {
  const suggestions = ['Create my first project', 'Launch my first campaign', 'Invite my team']

  if (scene.type === 'milestone') {
    return (
      <div
        className="absolute bottom-3 right-3 rounded-2xl p-4 flex items-start gap-3 animate-fade-up"
        style={{
          background: '#fff',
          border: '1px solid rgba(124,58,237,0.20)',
          boxShadow: '0 8px 32px rgba(124,58,237,0.18)',
          maxWidth: 220,
        }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#7C3AED,#a78bfa)' }}>
          <Trophy className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-[12px] font-bold" style={{ color: '#1a1a2e' }}>🎉 First campaign launched!</p>
          <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#666' }}>
            You did it in under {scene.time} minutes. Your audience is ready.
          </p>
        </div>
      </div>
    )
  }

  if (scene.type === 'stuck') {
    return (
      <div
        className="absolute bottom-3 right-3 rounded-2xl p-4 flex items-start gap-3 animate-fade-up"
        style={{
          background: '#fff',
          border: '1px solid rgba(245,158,11,0.30)',
          boxShadow: '0 8px 24px rgba(245,158,11,0.12)',
          maxWidth: 220,
        }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(245,158,11,0.10)' }}>
          <Zap className="h-4 w-4" style={{ color: '#d97706' }} />
        </div>
        <div>
          <p className="text-[12px] font-bold" style={{ color: '#1a1a2e' }}>Looks like you're stuck</p>
          <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#666' }}>
            Need help with Projects? I can walk you through it in 2 minutes.
          </p>
        </div>
      </div>
    )
  }

  // Chat widget for suggestions + chat scenes
  return (
    <div
      className="absolute bottom-3 right-3 rounded-2xl overflow-hidden"
      style={{
        background: '#fff',
        border: '1px solid rgba(14,11,26,0.10)',
        boxShadow: '0 8px 32px rgba(14,11,26,0.12)',
        width: 220,
      }}
    >
      {/* Widget header */}
      <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: '#7C3AED' }}>
        <MessageSquare className="h-3.5 w-3.5 text-white" />
        <span className="text-[11px] font-bold text-white">Cognity</span>
        <span className="ml-auto flex items-center gap-1 text-[9px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Live
        </span>
      </div>

      {/* Messages area */}
      <div className="p-3 space-y-2" style={{ minHeight: 90 }}>
        {/* AI opening */}
        <div
          className="rounded-xl rounded-bl-sm px-3 py-2 text-[10px] leading-relaxed"
          style={{ background: '#f1f5f9', color: '#333', maxWidth: '90%' }}
        >
          {scene.type === 'suggestions'
            ? 'Hey — what are you trying to accomplish today?'
            : 'Great choice. I\'ll highlight the "New Project" button for you — it\'s the fastest path to getting started.'}
        </div>

        {/* Suggested inputs (first scene only) */}
        {scene.type === 'suggestions' && (
          <div className="flex flex-col gap-1.5 mt-2">
            {suggestions.map(s => (
              <div
                key={s}
                className="rounded-lg px-2.5 py-1.5 text-[9px] font-medium cursor-pointer"
                style={{
                  border: '1px solid rgba(124,58,237,0.25)',
                  background: 'rgba(124,58,237,0.05)',
                  color: '#7C3AED',
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}

        {/* User reply bubble */}
        {scene.type === 'chat' && (
          <div className="flex justify-end">
            <div
              className="rounded-xl rounded-br-sm px-3 py-2 text-[10px] leading-relaxed"
              style={{ background: '#7C3AED', color: '#fff', maxWidth: '85%' }}
            >
              {scene.userMsg}
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="px-3 py-2 flex items-center gap-2" style={{ borderTop: '1px solid rgba(14,11,26,0.06)' }}>
        <div className="flex-1 rounded-full px-2.5 py-1.5 text-[9px]" style={{ background: '#f8f9fc', color: '#aaa' }}>
          Ask anything…
        </div>
      </div>
    </div>
  )
}

// ─── Scene label ─────────────────────────────────────────────────────────────
const sceneLabels: Record<Scene['type'], string> = {
  suggestions: 'Intent capture',
  chat:        'Personalised guidance',
  spotlight:   'Next-action highlight',
  stuck:       'Stuck-user detection',
  milestone:   'Milestone celebration',
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ChatDemo() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(i => (i + 1) % scenes.length)
    }, SCENE_DURATION)
    return () => clearInterval(id)
  }, [])

  const scene = scenes[index]

  return (
    <div className="relative">
      {/* Purple glow halo */}
      <div
        aria-hidden
        className="absolute -inset-8 rounded-[48px] opacity-50 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)' }}
      />

      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: '28px',
          border: '1px solid rgba(14,11,26,0.10)',
          background: '#fff',
          boxShadow: '0 8px 40px rgba(14,11,26,0.10), 0 2px 8px rgba(14,11,26,0.06)',
        }}
      >
        {/* Demo header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid rgba(14,11,26,0.06)', background: 'var(--mist)' }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
          </div>
          <div
            className="rounded-full px-3 py-1 text-[10px] font-medium"
            style={{ background: 'rgba(124,58,237,0.08)', color: 'var(--purple)' }}
          >
            {sceneLabels[scene.type]}
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live demo
          </span>
        </div>

        {/* Demo content */}
        <div className="relative p-4" style={{ minHeight: 280, background: '#f8f9fc' }}>
          <MockApp scene={scene} />
          <WidgetOverlay scene={scene} />
        </div>

        {/* Scene progress dots */}
        <div
          className="flex items-center justify-center gap-1.5 py-3"
          style={{ borderTop: '1px solid rgba(14,11,26,0.06)', background: 'var(--mist)' }}
        >
          {scenes.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="rounded-full transition-all"
              style={{
                width:      i === index ? 20 : 6,
                height:     6,
                background: i === index ? 'var(--purple)' : 'rgba(124,58,237,0.20)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating stats badge */}
      <div
        className="absolute -bottom-4 -left-4 rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{
          background: '#fff',
          border: '1px solid rgba(14,11,26,0.08)',
          boxShadow: '0 4px 20px rgba(14,11,26,0.10)',
        }}
      >
        <div className="text-center">
          <p className="text-[20px] font-extrabold leading-none" style={{ color: 'var(--void)' }}>2.4×</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>activation lift</p>
        </div>
        <div className="w-px h-8" style={{ background: 'rgba(14,11,26,0.08)' }} />
        <div className="text-center">
          <p className="text-[20px] font-extrabold leading-none" style={{ color: 'var(--purple)' }}>45s</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>stuck detection</p>
        </div>
      </div>
    </div>
  )
}
