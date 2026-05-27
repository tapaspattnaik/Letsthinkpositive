'use client'

import { useState, useRef, useEffect } from 'react'
import { LtpLogo } from '@/components/ui/LtpLogo'
import { useBitChat } from '@/hooks/useBitChat'

const MOODS = [
  { label: 'Low',      emoji: '😔', color: 'hover:bg-blue-50  hover:border-blue-300  hover:text-blue-600'  },
  { label: 'Okay',     emoji: '😐', color: 'hover:bg-slate-50 hover:border-slate-300 hover:text-slate-600' },
  { label: 'Good',     emoji: '🙂', color: 'hover:bg-teal-50  hover:border-teal-300  hover:text-teal-600'  },
  { label: 'Great',    emoji: '😊', color: 'hover:bg-green-50 hover:border-green-300 hover:text-green-600' },
  { label: 'Grateful', emoji: '🌟', color: 'hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600' },
]

const STARTERS = [
  { text: "I'm feeling overwhelmed today",            icon: '🌊' },
  { text: "Guide me through a short meditation",      icon: '🧘' },
  { text: "I need perspective on a tough situation",  icon: '🔍' },
  { text: "Share wisdom about letting go",            icon: '🍃' },
  { text: "Help me find things to be grateful for",  icon: '✨' },
]

export default function AdvisorPage() {
  const [input,   setInput]   = useState('')
  const [started, setStarted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  const { messages, mood, setMood, streaming, send } = useBitChat()

  const msgCount = messages.length
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (msgCount > 0) setStarted(true)
  }, [msgCount])

  async function handleSend(text?: string) {
    const content = (text ?? input).trim()
    if (!content) return
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    await send(content)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const selectedMood = MOODS.find(m => m.label === mood)

  return (
    <div className="h-screen overflow-hidden flex flex-col pt-[72px] bg-gradient-to-br from-teal-ghost via-ivory to-white">
      <div className="flex flex-1 overflow-hidden max-w-6xl w-full mx-auto px-4 md:px-6 py-4 gap-4">

        {/* ── Sidebar ─────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-[260px] flex-shrink-0 gap-4">
          <div className="bg-white rounded-[22px] border border-teal-light p-5 flex items-center gap-3 shadow-card">
            <div className="relative">
              <LtpLogo size={44} />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal-mid border-2 border-white" />
            </div>
            <div>
              <p className="font-bold text-[0.95rem] text-charcoal leading-none">Bit</p>
              <p className="text-[0.73rem] text-teal-mid mt-0.5">AI Companion · Online</p>
            </div>
          </div>

          <div className="bg-white rounded-[22px] border border-teal-light p-5 shadow-card">
            <p className="text-[0.72rem] font-bold tracking-widest uppercase text-text-xlight mb-3">How are you feeling?</p>
            <div className="space-y-1.5">
              {MOODS.map(m => (
                <button key={m.label} onClick={() => setMood(mood === m.label ? '' : m.label)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-[12px] border text-[0.85rem] font-medium transition-all text-left
                    ${mood === m.label ? 'bg-teal-deep text-white border-teal-deep' : `border-teal-light text-text-mid bg-teal-ghost/30 ${m.color}`}`}>
                  <span className="text-[1rem]">{m.emoji}</span>
                  {m.label}
                  {mood === m.label && <span className="ml-auto text-[0.7rem] opacity-70">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[22px] border border-teal-light p-5 shadow-card flex-1">
            <p className="text-[0.72rem] font-bold tracking-widest uppercase text-text-xlight mb-3">Try asking…</p>
            <div className="space-y-1.5">
              {STARTERS.map(s => (
                <button key={s.text} onClick={() => handleSend(s.text)} disabled={streaming}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-[12px] border border-teal-light text-left text-[0.8rem] text-text-mid hover:bg-teal-ghost hover:text-teal-deep hover:border-teal-mid transition-all disabled:opacity-50">
                  <span className="text-[0.9rem] flex-shrink-0 mt-0.5">{s.icon}</span>
                  <span className="leading-[1.5]">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Chat panel ──────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-[24px] border border-teal-light shadow-card">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-teal-light flex-shrink-0">
            <div className="relative md:hidden">
              <LtpLogo size={32} />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-teal-mid border-2 border-white" />
            </div>
            <div>
              <p className="font-semibold text-[0.9rem] text-charcoal leading-none">Bit Advisor</p>
              <p className="text-[0.72rem] text-text-xlight">
                {selectedMood ? `Feeling ${selectedMood.emoji} ${selectedMood.label} · ` : ''}
                Compassionate AI companion
              </p>
            </div>
            <div className="md:hidden ml-auto flex gap-1">
              {MOODS.map(m => (
                <button key={m.label} onClick={() => setMood(mood === m.label ? '' : m.label)} title={m.label}
                  className={`text-[1rem] p-1 rounded-full transition-all ${mood === m.label ? 'bg-teal-deep' : 'hover:bg-teal-ghost'}`}>
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4">
            {!started && (
              <div className="flex flex-col items-center justify-center h-full text-center py-6">
                <LtpLogo size={52} />
                <h2 className="font-display text-[1.3rem] font-bold text-charcoal mt-4 mb-1">Hello, I&apos;m Bit 🌿</h2>
                <p className="text-text-mid text-[0.9rem] leading-[1.8] max-w-[360px]">
                  A calm, compassionate companion here to listen and offer guidance. What&apos;s on your mind today?
                </p>
                <div className="md:hidden mt-5 flex flex-col gap-2 w-full max-w-[340px]">
                  {STARTERS.map(s => (
                    <button key={s.text} onClick={() => handleSend(s.text)}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-teal-light text-[0.83rem] text-text-mid hover:bg-teal-ghost hover:text-teal-deep hover:border-teal-mid transition-all text-left">
                      <span>{s.icon}</span>{s.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {m.role === 'assistant' && (
                  <div className="flex-shrink-0 mt-1"><LtpLogo size={26} /></div>
                )}
                {m.role === 'user' && (
                  <div className="flex-shrink-0 mt-1 w-[26px] h-[26px] rounded-full bg-teal-deep flex items-center justify-center">
                    <span className="text-[0.6rem] text-white font-bold">You</span>
                  </div>
                )}
                <div className={`max-w-[78%] px-4 py-3 text-[0.9rem] leading-[1.8] rounded-[18px] ${
                  m.role === 'user' ? 'bg-teal-deep text-white rounded-tr-sm' : 'bg-teal-ghost text-text-mid rounded-tl-sm'
                }`}>
                  {m.content || (streaming && i === messages.length - 1
                    ? <span className="inline-flex gap-1 items-center h-[1.2em]">
                        {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                      </span>
                    : '')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-teal-light px-4 md:px-5 py-3.5">
            <div className="flex items-end gap-2.5">
              <textarea ref={inputRef} value={input} onChange={autoResize} onKeyDown={handleKey}
                placeholder="Share what's on your mind…  (Enter to send, Shift+Enter for new line)"
                rows={1}
                className="flex-1 border border-teal-light rounded-[16px] px-4 py-2.5 text-[0.9rem] text-charcoal bg-ivory outline-none focus:border-teal-mid transition-colors resize-none placeholder:text-text-xlight leading-[1.6]"
                style={{ maxHeight: '120px' }}
              />
              <button onClick={() => handleSend()} disabled={!input.trim() || streaming} aria-label="Send"
                className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-deep text-white flex items-center justify-center hover:bg-teal-dark disabled:opacity-40 transition-all">
                {streaming
                  ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2 8h12M8 2l6 6-6 6"/></svg>
                }
              </button>
            </div>
            <p className="text-center text-[0.7rem] text-text-xlight mt-2">
              Bit is an AI companion, not a therapist. For serious concerns please seek professional support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
