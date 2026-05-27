'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { LtpLogo } from '@/components/ui/LtpLogo'

type Role = 'user' | 'assistant'
interface Message { role: Role; content: string }

const CATEGORIES = [
  { id: 'mood',       label: 'Mood',       emoji: '😔', desc: 'How are you feeling right now?' },
  { id: 'motivation', label: 'Motivation',  emoji: '⚡', desc: 'Find energy and purpose today.' },
  { id: 'reflection', label: 'Reflection',  emoji: '🪞', desc: 'Look back with compassion.' },
  { id: 'calm',       label: 'Calm',        emoji: '🌬️', desc: 'Breathing and grounding.' },
  { id: 'gratitude',  label: 'Gratitude',   emoji: '💛', desc: 'Cultivate appreciation.' },
  { id: 'sleep',      label: 'Sleep',       emoji: '🌙', desc: 'Wind down and rest.' },
]

const STARTERS: Record<string, string[]> = {
  mood:       ["What emotion is most present for you right now?", "Take a breath. How does your body feel?", "What's one thing you're proud of today?"],
  motivation: ["What's one small step towards something that matters?", "When did you last feel genuinely energised?", "Write three things you appreciate about yourself."],
  reflection: ["What challenged you recently — and what did it teach you?", "If you could speak to your younger self, what would you say?", "What's a decision you made recently that you feel good about?"],
  calm:       ["Let's try box breathing together. Ready?", "I'm overwhelmed — guide me back to calm.", "What's one thing you can see, hear, and feel right now?"],
  gratitude:  ["What's one small thing from today you're grateful for?", "Who has positively influenced your life?", "What's something about your body you appreciate?"],
  sleep:      ["I'm struggling to wind down. Can you help?", "What's the most stressful thing on your mind right now?", "Guide me through a simple bedtime relaxation."],
}

export default function CoachPage() {
  const [category,  setCategory]  = useState('mood')
  const [messages,  setMessages]  = useState<Message[]>([])
  const [input,     setInput]     = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const hasMessages = messages.length > 0

  // Lock body scroll so footer can't be reached (chat is full-viewport)
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Auto-scroll only when messages exist (avoids jumping to footer on load)
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || streaming) return
    setInput('')
    if (inputRef.current) { inputRef.current.style.height = 'auto' }

    const userMsg: Message = { role: 'user', content: trimmed }
    const history = [...messages, userMsg]
    setMessages([...history, { role: 'assistant', content: '' }])
    setStreaming(true)

    try {
      const res = await fetch('/api/coach', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: history, category }),
      })
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          const t = line.trim()
          if (!t.startsWith('data: ')) continue
          const payload = t.slice(6)
          if (payload === '[DONE]') break outer
          try {
            const { text } = JSON.parse(payload)
            if (text) {
              accumulated += text
              const snap = accumulated
              setMessages(prev => {
                const u = [...prev]
                u[u.length - 1] = { role: 'assistant', content: snap }
                return u
              })
            }
          } catch { /* skip malformed */ }
        }
      }

      if (!accumulated) {
        setMessages(prev => {
          const u = [...prev]
          u[u.length - 1] = { role: 'assistant', content: "I'm here — it was quiet for a moment. Want to try again?" }
          return u
        })
      }
    } catch (err) {
      console.error('Coach error:', err)
      setMessages(prev => {
        const u = [...prev]
        u[u.length - 1] = { role: 'assistant', content: "I'm sorry, I couldn't connect just now. Please try again in a moment. 🌿" }
        return u
      })
    } finally {
      setStreaming(false)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [messages, streaming, category])

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  function newSession() {
    setMessages([])
    setInput('')
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  const activeCat = CATEGORIES.find(c => c.id === category)!

  return (
    <div className="flex h-[calc(100vh-72px)] overflow-hidden bg-ivory">

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[272px] flex-shrink-0 bg-white border-r border-teal-light overflow-y-auto">

        {/* Brand */}
        <div className="px-6 py-6 border-b border-teal-light">
          <div className="flex items-center gap-2.5 mb-2">
            <LtpLogo size={32} />
            <div>
              <p className="font-bold text-[1rem] text-charcoal leading-none">Calm Coach</p>
              <p className="text-[0.7rem] text-text-xlight mt-0.5">AI wellness companion</p>
            </div>
          </div>
          <p className="text-[0.82rem] text-text-mid leading-[1.65] mt-3">
            Gentle prompts and reflective support — any time you need a moment.
          </p>
        </div>

        {/* Category picker */}
        <div className="px-4 py-5 border-b border-teal-light">
          <p className="text-[0.68rem] font-bold text-text-xlight tracking-[0.14em] uppercase mb-3">Focus area</p>
          <div className="space-y-1">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-left transition-all
                  ${category === cat.id
                    ? 'bg-teal-deep text-white'
                    : 'text-text-mid hover:bg-teal-ghost hover:text-teal-deep'}`}>
                <span className="text-[1.1rem] flex-shrink-0">{cat.emoji}</span>
                <div>
                  <p className={`text-[0.87rem] font-semibold leading-none ${category === cat.id ? 'text-white' : ''}`}>{cat.label}</p>
                  <p className={`text-[0.72rem] mt-0.5 ${category === cat.id ? 'text-white/70' : 'text-text-xlight'}`}>{cat.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Starters */}
        <div className="px-4 py-5 flex-1">
          <p className="text-[0.68rem] font-bold text-text-xlight tracking-[0.14em] uppercase mb-3">Quick starters</p>
          <div className="space-y-1.5">
            {STARTERS[category].map((s, i) => (
              <button key={i} onClick={() => send(s)}
                disabled={streaming}
                className="w-full text-left text-[0.8rem] text-text-mid px-3 py-2.5 rounded-[12px] border border-teal-light hover:bg-teal-ghost hover:text-teal-deep hover:border-teal-mid disabled:opacity-50 transition-all leading-snug">
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="px-5 py-4 border-t border-teal-light bg-teal-ghost/30">
          <p className="text-[0.72rem] text-text-xlight leading-[1.6]">
            The Calm Coach is an AI assistant, not a therapist. In crisis, please contact a professional.
          </p>
        </div>
      </aside>

      {/* ── Chat area ────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-teal-light bg-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[1.3rem]">{activeCat.emoji}</span>
            <div>
              <p className="font-semibold text-[0.9rem] text-charcoal leading-none">{activeCat.label}</p>
              <p className="text-[0.7rem] text-text-xlight mt-0.5">{activeCat.desc}</p>
            </div>
          </div>
          {hasMessages && (
            <button onClick={newSession}
              className="text-[0.78rem] text-text-xlight hover:text-teal-deep border border-teal-light hover:border-teal-mid px-3 py-1.5 rounded-full transition-all">
              ＋ New session
            </button>
          )}
        </div>

        {/* Messages — scrollable middle */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">

          {/* Empty state */}
          {!hasMessages && (
            <div className="flex flex-col items-center justify-center h-full text-center pb-6">
              <LtpLogo size={48} />
              <h2 className="font-display text-[1.4rem] font-bold text-charcoal mt-4 mb-2">
                {activeCat.emoji} {activeCat.label}
              </h2>
              <p className="text-text-mid text-[0.9rem] leading-[1.7] max-w-[340px] mb-6">
                {activeCat.desc} Choose a starter below or type your own thought.
              </p>

              {/* Mobile starters (sidebar is hidden on mobile) */}
              <div className="lg:hidden w-full max-w-[400px] space-y-2 mb-6">
                {STARTERS[category].map((s, i) => (
                  <button key={i} onClick={() => send(s)}
                    className="w-full text-left text-[0.85rem] text-text-mid px-4 py-3 rounded-[14px] border border-teal-light hover:bg-teal-ghost hover:text-teal-deep hover:border-teal-mid transition-all">
                    {s}
                  </button>
                ))}
              </div>

              {/* Mobile category switcher */}
              <div className="lg:hidden flex flex-wrap justify-center gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-[0.78rem] font-medium border transition-all
                      ${category === cat.id
                        ? 'bg-teal-deep text-white border-teal-deep'
                        : 'bg-white text-text-mid border-teal-light hover:border-teal-mid'}`}>
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-teal-ghost flex items-center justify-center flex-shrink-0 mt-1">
                  <LtpLogo size={18} />
                </div>
              )}
              <div className={`max-w-[78%] px-5 py-3.5 rounded-[20px] text-[0.93rem] leading-[1.8] ${
                msg.role === 'user'
                  ? 'bg-teal-deep text-white rounded-tr-sm'
                  : 'bg-white border border-teal-light text-text-mid rounded-tl-sm shadow-sm'
              }`}>
                {msg.content || (streaming && i === messages.length - 1 ? (
                  <span className="flex gap-1.5 items-center py-0.5">
                    {[0, 1, 2].map(j => (
                      <span key={j} className="w-2 h-2 bg-teal-mid rounded-full animate-bounce" style={{ animationDelay: `${j * 150}ms` }} />
                    ))}
                  </span>
                ) : '')}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input — fixed at bottom */}
        <div className="flex-shrink-0 border-t border-teal-light bg-white px-4 py-3">
          <div className="flex gap-2 items-end max-w-3xl mx-auto">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={autoResize}
              onKeyDown={handleKey}
              disabled={streaming}
              placeholder="Type your message…"
              className="flex-1 resize-none border border-teal-light rounded-[14px] outline-none text-[0.93rem] text-charcoal bg-ivory placeholder:text-text-xlight px-4 py-2.5 focus:border-teal-mid transition-colors disabled:opacity-60"
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || streaming}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-deep text-white flex items-center justify-center hover:bg-teal-dark disabled:opacity-40 transition-all">
              {streaming
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <svg className="w-4 h-4" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 7h10M7 2l5 5-5 5"/>
                  </svg>
              }
            </button>
          </div>
          <p className="text-[0.63rem] text-text-xlight text-center mt-1.5 max-w-3xl mx-auto">
            The Calm Coach is an AI assistant, not a therapist. In crisis, please contact a professional.
          </p>
        </div>
      </div>
    </div>
  )
}
