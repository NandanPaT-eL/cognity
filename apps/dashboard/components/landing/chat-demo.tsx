"use client"

import { useEffect, useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'

const conversation = [
  { role: 'ai' as const,   text: 'Hey — what are you trying to accomplish today?' },
  { role: 'user' as const, text: 'I need to set up my first automation workflow' },
  { role: 'ai' as const,   text: 'Start in Automations → New workflow. Pick a trigger, then add one action. I can walk you through each step.' },
  { role: 'user' as const, text: 'Found it. What trigger should I use?' },
  { role: 'ai' as const,   text: 'For most teams, "New form submission" works great. Want me to explain how to connect your form?' },
]

export function ChatDemo() {
  const [visible, setVisible] = useState(1)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(v => (v < conversation.length ? v + 1 : 1))
    }, 2800)
    return () => clearInterval(id)
  }, [])

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
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            borderBottom: '1px solid rgba(14,11,26,0.06)',
            background: 'var(--mist)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--purple)' }}
            >
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold" style={{ color: 'var(--void)' }}>Cognity</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Guiding in real time</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>

        {/* Messages */}
        <div className="p-5 space-y-3 min-h-[280px]" style={{ background: 'var(--canvas)' }}>
          {conversation.slice(0, visible).map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
            >
              <div
                className="max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed"
                style={
                  msg.role === 'user'
                    ? {
                        background: 'var(--purple)',
                        color: '#fff',
                        borderBottomRightRadius: '6px',
                        boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
                      }
                    : {
                        background: 'var(--mist)',
                        color: 'rgba(14,11,26,0.80)',
                        border: '1px solid rgba(14,11,26,0.06)',
                        borderBottomLeftRadius: '6px',
                      }
                }
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input mock */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ borderTop: '1px solid rgba(14,11,26,0.06)' }}
        >
          <div
            className="flex-1 rounded-full px-4 py-2.5 text-[12px]"
            style={{ background: 'var(--mist)', color: 'var(--text-muted)' }}
          >
            Ask anything about your product…
          </div>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--purple)' }}
          >
            <Send className="h-3.5 w-3.5 text-white" />
          </div>
        </div>
      </div>

      {/* Floating badge */}
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
