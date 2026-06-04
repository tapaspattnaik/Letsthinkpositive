'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { LtpLogo } from '@/components/ui/LtpLogo'

type Role = 'user' | 'assistant'
interface Message { role: Role; content: string; error?: boolean }

const CATEGORIES = [
  { id: 'mood',       label: 'Mood',       emoji: '😔', desc: 'How are you feeling right now?' },
  { id: 'motivation', label: 'Motivation',  emoji: '⚡', desc: 'Find energy and purpose today.' },
  { id: 'reflection', label: 'Reflection',  emoji: '🪞', desc: 'Look back with compassion.' },
  { id: 'calm',       label: 'Calm',        emoji: '🌬️', desc: 'Breathing and grounding.' },
  { id: 'gratitude',  label: 'Gratitude',   emoji: '💛', desc: 'Cultivate appreciation.' },
  { id: 'sleep',      label: 'Sleep',       emoji: '🌙', desc: 'Wind down and rest.' },
]

const STARTERS: Record<string, string[]> = {
  mood:       ['What emotion is most present for you right now?', 'Take a breath. How does your body feel?', "What's one thing you're proud of today?"],
  motivation: ["What's one small step towards something that matters?", 'When did you last feel genuinely energised?', 'Write three things you appreciate about yourself.'],
  reflection: ['What challenged you recently — and what did it teach you?', 'If you could speak to your younger self, what would you say?', "What's a decision you made recently that you feel good about?"],
  calm:       ["Let's try box breathing together. Ready?", "I'm overwhelmed — guide me back to calm.", "What's one thing you can see, hear, and feel right now?"],
  gratitude:  ["What's one small thing from today you're grateful for?", 'Who has positively influenced your life?', "What's something about your body you appreciate?"],
  sleep:      ["I'm struggling to wind down. Can you help?", "What's the most stressful thing on your mind right now?", 'Guide me through a simple bedtime relaxation.'],
}

// Minimal markdown: bold, bullets — no extra deps
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const out: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) { out.push(<br key={key++} />); continue }

    // Bullet point
    const isBullet = /^[-*•]\s/.test(trimmed)
    const content  = isBullet ? trimmed.slice(2) : trimmed

    // Inline bold: **text**
    const parts = content.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i}>{p.slice(2, -2)}</strong>
        : p
    )

    if (isBullet) {
      out.push(
        <div key={key++} className="flex gap-2 items-start">
          <span className="text-teal-mid mt-[3px] flex-shrink-0">•</span>
          <span>{parts}</span>
        </div>
      )
    } else {
      out.push(<p key={key++} className="leading-[1.75]">{parts}</p>)
    }
  }
  return out
}

export default function CoachPage() {
  const [category,   setCategory]   = useState('mood')
  const [messages,   setMessages]   = useState<Message[]>([])
  const [input,      setInput]      = useState('')
  const [streaming,  setStreaming]  = useState(false)
  const [showDots,   setShowDots]   = useState(false)

  // Refs — avoid stale closures and prevent recreation on every chunk
  const messagesRef    = useRef<Message[]>([])
  const categoryRef    = useRef(category)
  const streamingRef   = useRef(false)
  const accRef         = useRef('')       // accumulated streaming text
  const rafRef         = useRef<number>(0)
  const bottomRef      = useRef<HTMLDivElement>(null)
  const scrollAreaRef  = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)
  const isNearBottom   = useRef(true)

  // Keep refs in sync
  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { categoryRef.current = category },  [category])

  // Track if user is near bottom so we don't force-scroll mid-read
  useEffect(() => {
    const el = scrollAreaRef.current
    if (!el) return
    const onScroll = () => {
      isNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Smooth scroll only when near bottom
  const scrollToBottom = useCallback(() => {
    if (isNearBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [])

  // RAF-batched flush — updates React state at most once per animation frame
  const flushAccumulated = useCallback(() => {
    const text = accRef.current
    setMessages(prev => {
      const next = [...prev]
      if (next.length > 0 && next[next.length - 1].role === 'assistant') {
        next[next.length - 1] = { role: 'assistant', content: text }
      }
      return next
    })
    scrollToBottom()
  }, [scrollToBottom])

  const scheduleFlush = useCallback(() => {
    if (rafRef.current) return // already scheduled
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      flushAccumulated()
    })
  }, [flushAccumulated])

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || streamingRef.current) return

    setInput('')
    if (inputRef.current) { inputRef.current.style.height = 'auto' }

    const history: Message[] = [...messagesRef.current, { role: 'user', content: trimmed }]
    const withPlaceholder = [...history, { role: 'assistant' as Role, content: '' }]

    messagesRef.current = withPlaceholder
    setMessages(withPlaceholder)
    streamingRef.current = true
    setStreaming(true)
    setShowDots(true)
    accRef.current = ''
    isNearBottom.current = true
    setTimeout(scrollToBottom, 50)

    try {
      const res = await fetch('/api/coach', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
          category: categoryRef.current,
        }),
      })

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

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
            const { text: chunk } = JSON.parse(payload)
            if (chunk) {
              if (!accRef.current) setShowDots(false) // hide dots on first real token
              accRef.current += chunk
              scheduleFlush()
            }
          } catch { /* skip malformed */ }
        }
      }

      // Final flush
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      const finalText = accRef.current

      setMessages(prev => {
        const next = [...prev]
        if (next.length > 0 && next[next.length - 1].role === 'assistant') {
          next[next.length - 1] = {
            role:  'assistant',
            content: finalText || "I'm here — it was quiet for a moment. Want to try again?",
            error: !finalText,
          }
        }
        return next
      })
      setTimeout(scrollToBottom, 80)

    } catch (err) {
      console.error('Coach error:', err)
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      setMessages(prev => {
        const next = [...prev]
        if (next.length > 0 && next[next.length - 1].role === 'assistant') {
          next[next.length - 1] = {
            role: 'assistant',
            content: "I couldn't connect just now. Please try again.",
            error: true,
          }
        }
        return next
      })
    } finally {
      streamingRef.current = false
      setStreaming(false)
      setShowDots(false)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [scheduleFlush, scrollToBottom])

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 130) + 'px'
  }

  function newSession() {
    setMessages([])
    messagesRef.current = []
    setInput('')
    accRef.current = ''
    isNearBottom.current = true
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  function retryLast() {
    const msgs = messagesRef.current
    // Find last user message before the error
    let lastUser = ''
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') { lastUser = msgs[i].content; break }
    }
    if (!lastUser) return
    // Remove the failed assistant reply and resend
    const trimmed = msgs.filter((_, i) => !(i === msgs.length - 1 && msgs[i].role === 'assistant' && msgs[i].error))
    const withoutLast = trimmed.slice(0, -1) // remove the user msg too, send will re-add
    setMessages(withoutLast)
    messagesRef.current = withoutLast
    send(lastUser)
  }

  const activeCat  = CATEGORIES.find(c => c.id === category)!
  const hasMessages = messages.length > 0

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#f8f9fa]">

      {/* ── Sidebar (desktop only) ──────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto">

        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5 mb-2">
            <LtpLogo size={30} />
            <div>
              <p className="font-bold text-[0.95rem] text-charcoal leading-none">Calm Coach</p>
              <p className="text-[0.68rem] text-text-xlight mt-0.5">AI wellness companion</p>
            </div>
          </div>
          <p className="text-[0.8rem] text-text-mid leading-[1.65] mt-3">
            Gentle prompts and reflective support — any time you need a moment.
          </p>
        </div>

        {/* Category picker */}
        <div className="px-3 py-4 border-b border-gray-100">
          <p className="text-[0.65rem] font-bold text-text-xlight tracking-[0.12em] uppercase mb-2.5 px-2">Focus area</p>
          <div className="space-y-0.5">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150
                  ${category === cat.id
                    ? 'bg-teal-deep text-white shadow-sm'
                    : 'text-text-mid hover:bg-gray-50 hover:text-teal-deep'}`}>
                <span className="text-[1rem] flex-shrink-0">{cat.emoji}</span>
                <div>
                  <p className={`text-[0.84rem] font-semibold leading-none ${category === cat.id ? 'text-white' : ''}`}>{cat.label}</p>
                  <p className={`text-[0.69rem] mt-0.5 leading-snug ${category === cat.id ? 'text-white/70' : 'text-text-xlight'}`}>{cat.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Starters */}
        <div className="px-3 py-4 flex-1 overflow-y-auto">
          <p className="text-[0.65rem] font-bold text-text-xlight tracking-[0.12em] uppercase mb-2.5 px-2">Quick starters</p>
          <div className="space-y-1">
            {STARTERS[category].map((s, i) => (
              <button key={i} onClick={() => send(s)}
                disabled={streaming}
                className="w-full text-left text-[0.78rem] text-text-mid px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-teal-ghost hover:text-teal-deep hover:border-teal-light disabled:opacity-40 transition-all leading-snug">
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60">
          <p className="text-[0.68rem] text-text-xlight leading-[1.6]">
            AI assistant, not a therapist. In crisis, please contact a professional.
          </p>
        </div>
      </aside>

      {/* ── Main chat area ──────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            {/* Mobile: logo */}
            <div className="lg:hidden">
              <LtpLogo size={26} />
            </div>
            <div>
              <p className="font-semibold text-[0.88rem] text-charcoal leading-none">
                {activeCat.emoji} {activeCat.label}
              </p>
              <p className="text-[0.68rem] text-text-xlight mt-0.5 hidden sm:block">{activeCat.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile category pills */}
            <div className="lg:hidden flex gap-1.5 overflow-x-auto no-scrollbar">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[0.72rem] font-medium border transition-all
                    ${category === cat.id
                      ? 'bg-teal-deep text-white border-teal-deep'
                      : 'bg-white text-text-mid border-gray-200 hover:border-teal-mid'}`}>
                  {cat.emoji}
                </button>
              ))}
            </div>

            {hasMessages && (
              <button onClick={newSession}
                className="text-[0.75rem] text-text-xlight hover:text-teal-deep border border-gray-200 hover:border-teal-mid px-3 py-1.5 rounded-full transition-all whitespace-nowrap">
                + New
              </button>
            )}
          </div>
        </div>

        {/* Messages scroll area */}
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

            {/* Empty state */}
            {!hasMessages && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-teal-ghost flex items-center justify-center mb-4 shadow-sm">
                  <LtpLogo size={36} />
                </div>
                <h2 className="font-display text-[1.35rem] font-bold text-charcoal mb-2">
                  {activeCat.emoji} {activeCat.label}
                </h2>
                <p className="text-text-mid text-[0.88rem] leading-[1.7] max-w-[320px] mb-8">
                  {activeCat.desc} Choose a starter or type your own thought.
                </p>

                {/* Starters grid */}
                <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
                  {STARTERS[category].map((s, i) => (
                    <button key={i} onClick={() => send(s)}
                      className="text-left text-[0.82rem] text-text-mid px-4 py-3.5 rounded-2xl border border-gray-200 bg-white hover:bg-teal-ghost hover:text-teal-deep hover:border-teal-mid shadow-sm transition-all leading-snug">
                      {s}
                    </button>
                  ))}
                </div>

                {/* Mobile category switcher */}
                <div className="lg:hidden flex flex-wrap justify-center gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-[0.76rem] font-medium border transition-all
                        ${category === cat.id
                          ? 'bg-teal-deep text-white border-teal-deep'
                          : 'bg-white text-text-mid border-gray-200 hover:border-teal-mid'}`}>
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg, i) => {
              const isLast     = i === messages.length - 1
              const isStreaming = isLast && streaming && msg.role === 'assistant'
              const isEmpty    = msg.role === 'assistant' && !msg.content

              return (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                  {/* Avatar */}
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-teal-ghost border border-teal-light flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <LtpLogo size={16} />
                    </div>
                  )}

                  {/* Bubble */}
                  <div className={`group relative max-w-[80%] sm:max-w-[72%] ${
                    msg.role === 'user'
                      ? 'bg-teal-deep text-white rounded-[20px] rounded-tr-[6px] px-4 py-3 shadow-sm'
                      : msg.error
                      ? 'bg-red-50 border border-red-100 text-red-700 rounded-[20px] rounded-tl-[6px] px-4 py-3'
                      : 'bg-white border border-gray-100 text-text-mid rounded-[20px] rounded-tl-[6px] px-4 py-3 shadow-sm'
                  }`}>

                    {/* Typing dots */}
                    {isEmpty && showDots && isStreaming && (
                      <span className="flex gap-1.5 items-center py-1">
                        {[0, 1, 2].map(j => (
                          <span key={j}
                            className="w-2 h-2 bg-teal-mid rounded-full animate-bounce"
                            style={{ animationDelay: `${j * 160}ms` }} />
                        ))}
                      </span>
                    )}

                    {/* Actual content */}
                    {!isEmpty && (
                      <div className={`text-[0.9rem] space-y-1.5 ${msg.role === 'user' ? 'text-white' : ''}`}>
                        {msg.role === 'assistant'
                          ? renderMarkdown(msg.content)
                          : <p className="leading-[1.7]">{msg.content}</p>
                        }
                      </div>
                    )}

                    {/* Error retry */}
                    {msg.error && isLast && !streaming && (
                      <button onClick={retryLast}
                        className="mt-2.5 flex items-center gap-1.5 text-[0.75rem] font-medium text-red-500 hover:text-red-700 transition-colors">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0 1 15-1.8M20 15a9 9 0 0 1-15 1.8"/>
                        </svg>
                        Try again
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            <div ref={bottomRef} className="h-1" />
          </div>
        </div>

        {/* Input bar — fixed at bottom */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 pt-3 pb-4 shadow-[0_-1px_6px_rgba(0,0,0,0.04)]">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 items-end bg-[#f8f9fa] rounded-2xl border border-gray-200 focus-within:border-teal-mid focus-within:bg-white transition-all px-3 py-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={autoResize}
                onKeyDown={handleKey}
                disabled={streaming}
                placeholder={streaming ? 'Coach is thinking…' : 'Type a message…'}
                className="flex-1 resize-none bg-transparent outline-none text-[0.9rem] text-charcoal placeholder:text-text-xlight py-1.5 disabled:opacity-60"
                style={{ maxHeight: '130px' }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || streaming}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-teal-deep text-white flex items-center justify-center hover:bg-teal-dark disabled:opacity-35 transition-all mb-0.5">
                {streaming
                  ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 8h12M8 2l6 6-6 6"/>
                    </svg>
                }
              </button>
            </div>

            {/* Mobile starters when no messages */}
            {!hasMessages && (
              <div className="lg:hidden mt-2.5 flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                {STARTERS[category].map((s, i) => (
                  <button key={i} onClick={() => send(s)}
                    className="flex-shrink-0 text-[0.76rem] text-teal-deep bg-teal-ghost border border-teal-light px-3 py-1.5 rounded-full whitespace-nowrap transition-all hover:bg-teal-light">
                    {s}
                  </button>
                ))}
              </div>
            )}

            <p className="text-[0.62rem] text-text-xlight text-center mt-2">
              AI assistant · not a therapist · in crisis contact a professional
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
