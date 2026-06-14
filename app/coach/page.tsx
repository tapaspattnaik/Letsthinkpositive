'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { LtpLogo } from '@/components/ui/LtpLogo'
import { useLanguage } from '@/context/LanguageContext'

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

// Minimal markdown: bold + bullets, no deps
function renderMarkdown(text: string) {
  const out: React.ReactNode[] = []
  let key = 0
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t) { out.push(<br key={key++} />); continue }
    const isBullet = /^[-*•]\s/.test(t)
    const content  = isBullet ? t.slice(2) : t
    const parts    = content.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
      p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p
    )
    if (isBullet) {
      out.push(<div key={key++} className="flex gap-2 items-start"><span className="text-teal-mid mt-[3px] flex-shrink-0">•</span><span>{parts}</span></div>)
    } else {
      out.push(<p key={key++} className="leading-[1.75]">{parts}</p>)
    }
  }
  return out
}

export default function CoachPage() {
  const [category,  setCategory]  = useState('mood')
  const [messages,  setMessages]  = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [input,     setInput]     = useState('')

  // Stable refs — no stale closures, no re-render on update
  const { language } = useLanguage()
  const languageRef  = useRef(language)
  useEffect(() => { languageRef.current = language }, [language])

  const messagesRef      = useRef<Message[]>([])
  const categoryRef      = useRef(category)
  const streamingRef     = useRef(false)
  const accRef           = useRef('')
  const streamingDivRef  = useRef<HTMLDivElement>(null)  // ← direct DOM for streaming text
  const scrollAreaRef    = useRef<HTMLDivElement>(null)
  const bottomRef        = useRef<HTMLDivElement>(null)
  const inputRef         = useRef<HTMLTextAreaElement>(null)
  const atBottomRef      = useRef(true)
  const scrollRafRef     = useRef(0)

  useEffect(() => { categoryRef.current = category }, [category])

  // Proactive opener — the coach greets first, with context, instead of waiting
  const [opener, setOpener] = useState<string | null>(null)
  useEffect(() => {
    fetch('/api/coach-opener')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.opener) setOpener(d.opener) })
      .catch(() => {})
  }, [])

  // Track scroll position
  useEffect(() => {
    const el = scrollAreaRef.current
    if (!el) return
    const onScroll = () => {
      atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Throttled scroll — only fires once per frame, only when near bottom
  const scheduleScroll = useCallback(() => {
    if (scrollRafRef.current) return
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = 0
      if (atBottomRef.current) {
        bottomRef.current?.scrollIntoView({ block: 'end' })
      }
    })
  }, [])

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || streamingRef.current) return

    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'

    // Build new history and add assistant placeholder
    const history: Message[] = [...messagesRef.current, { role: 'user', content: trimmed }]
    const withPlaceholder: Message[] = [...history, { role: 'assistant', content: '' }]

    messagesRef.current = withPlaceholder
    streamingRef.current = true
    accRef.current = ''
    atBottomRef.current = true

    // ── Single React render: add user msg + empty assistant bubble ──
    setMessages(withPlaceholder)
    setStreaming(true)
    setTimeout(scheduleScroll, 30)

    try {
      const res = await fetch('/api/coach', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
          category: categoryRef.current,
          language: languageRef.current,
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
              accRef.current += chunk
              // ── Direct DOM write — zero React re-renders during streaming ──
              if (streamingDivRef.current) {
                streamingDivRef.current.textContent = accRef.current
              }
              scheduleScroll()
            }
          } catch { /* skip malformed */ }
        }
      }

      // ── Streaming done: clear DOM ref FIRST, then one final React render ──
      // Clearing the streaming div before setMessages prevents a 1-frame
      // overlap where the direct DOM text AND the React-rendered text both
      // appear in the same paint → causes the duplicate message bug.
      if (streamingDivRef.current) streamingDivRef.current.textContent = ''

      const finalText = accRef.current
      const finalMessages = messagesRef.current.map((m, i) =>
        i === messagesRef.current.length - 1
          ? { role: 'assistant' as Role, content: finalText || "I'm here — want to try again?", error: !finalText }
          : m
      )
      messagesRef.current = finalMessages
      setMessages(finalMessages)
      setTimeout(scheduleScroll, 80)

    } catch (err) {
      console.error('Coach error:', err)
      const errorMessages = messagesRef.current.map((m, i) =>
        i === messagesRef.current.length - 1
          ? { role: 'assistant' as Role, content: "I couldn't connect just now. Please try again.", error: true }
          : m
      )
      messagesRef.current = errorMessages
      setMessages(errorMessages)
    } finally {
      streamingRef.current = false
      setStreaming(false)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [scheduleScroll])

  function retryLast() {
    const msgs = messagesRef.current
    let lastUser = ''
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') { lastUser = msgs[i].content; break }
    }
    if (!lastUser) return
    const trimmed = msgs.filter((_, i) => !(i >= msgs.length - 2))
    messagesRef.current = trimmed
    setMessages(trimmed)
    send(lastUser)
  }

  function newSession() {
    // Extract memories from the conversation before clearing (fire & forget)
    const history = messagesRef.current
    if (history.length >= 2) {
      fetch('/api/memory', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: history, source: 'coach' }),
      }).catch(() => {})
    }
    messagesRef.current = []
    accRef.current = ''
    setMessages([])
    setInput('')
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 130) + 'px'
  }

  const activeCat   = CATEGORIES.find(c => c.id === category)!
  const hasMessages = messages.length > 0

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#f8f9fa]">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto">
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

        <div className="px-3 py-4 border-b border-gray-100">
          <p className="text-[0.65rem] font-bold text-text-xlight tracking-[0.12em] uppercase mb-2.5 px-2">Focus area</p>
          <div className="space-y-0.5">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150
                  ${category === cat.id ? 'bg-teal-deep text-white shadow-sm' : 'text-text-mid hover:bg-gray-50 hover:text-teal-deep'}`}>
                <span className="text-[1rem] flex-shrink-0">{cat.emoji}</span>
                <div>
                  <p className={`text-[0.84rem] font-semibold leading-none ${category === cat.id ? 'text-white' : ''}`}>{cat.label}</p>
                  <p className={`text-[0.69rem] mt-0.5 leading-snug ${category === cat.id ? 'text-white/70' : 'text-text-xlight'}`}>{cat.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="px-3 py-4 flex-1">
          <p className="text-[0.65rem] font-bold text-text-xlight tracking-[0.12em] uppercase mb-2.5 px-2">Quick starters</p>
          <div className="space-y-1">
            {STARTERS[category].map((s, i) => (
              <button key={i} onClick={() => send(s)} disabled={streaming}
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

      {/* ── Chat area ───────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="lg:hidden"><LtpLogo size={26} /></div>
            <div>
              <p className="font-semibold text-[0.88rem] text-charcoal leading-none">{activeCat.emoji} {activeCat.label}</p>
              <p className="text-[0.68rem] text-text-xlight mt-0.5 hidden sm:block">{activeCat.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="lg:hidden flex gap-1.5 overflow-x-auto no-scrollbar">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[0.72rem] font-medium border transition-all
                    ${category === cat.id ? 'bg-teal-deep text-white border-teal-deep' : 'bg-white text-text-mid border-gray-200 hover:border-teal-mid'}`}>
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

        {/* Messages */}
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
                {opener ? (
                  /* Contextual greeting — the coach speaks first */
                  <div className="max-w-[380px] bg-white border border-teal-light rounded-2xl rounded-tl-md shadow-sm px-5 py-3.5 mb-8 text-left">
                    <p className="text-charcoal text-[0.9rem] leading-[1.7]">{opener}</p>
                  </div>
                ) : (
                  <p className="text-text-mid text-[0.88rem] leading-[1.7] max-w-[320px] mb-8">
                    {activeCat.desc} Choose a starter or type your own thought.
                  </p>
                )}
                <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
                  {STARTERS[category].map((s, i) => (
                    <button key={i} onClick={() => send(s)}
                      className="text-left text-[0.82rem] text-text-mid px-4 py-3.5 rounded-2xl border border-gray-200 bg-white hover:bg-teal-ghost hover:text-teal-deep hover:border-teal-mid shadow-sm transition-all leading-snug">
                      {s}
                    </button>
                  ))}
                </div>
                <div className="lg:hidden flex flex-wrap justify-center gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-[0.76rem] font-medium border transition-all
                        ${category === cat.id ? 'bg-teal-deep text-white border-teal-deep' : 'bg-white text-text-mid border-gray-200 hover:border-teal-mid'}`}>
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg, i) => {
              const isLastAssistant = i === messages.length - 1 && msg.role === 'assistant'
              const isStreamingBubble = isLastAssistant && streaming

              return (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-teal-ghost border border-teal-light flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <LtpLogo size={16} />
                    </div>
                  )}
                  <div className={`max-w-[80%] sm:max-w-[72%] px-4 py-3 rounded-[20px] text-[0.9rem] ${
                    msg.role === 'user'
                      ? 'bg-teal-deep text-white rounded-tr-[6px] shadow-sm'
                      : msg.error
                      ? 'bg-red-50 border border-red-100 text-red-700 rounded-tl-[6px]'
                      : 'bg-white border border-gray-100 text-text-mid rounded-tl-[6px] shadow-sm'
                  }`}>

                    {/* Typing dots — only when empty AND streaming */}
                    {isStreamingBubble && !msg.content && (
                      <span className="flex gap-1.5 items-center py-1">
                        {[0, 1, 2].map(j => (
                          <span key={j} className="w-2 h-2 bg-teal-mid rounded-full animate-bounce"
                            style={{ animationDelay: `${j * 160}ms` }} />
                        ))}
                      </span>
                    )}

                    {/*
                      Streaming bubble: attach ref here so we can write textContent
                      directly without React re-renders. React renders it empty,
                      the streaming loop writes to the DOM directly.
                      On streaming end, React re-renders once with full content.
                    */}
                    {isStreamingBubble && msg.content === '' ? (
                      <div ref={streamingDivRef} className="space-y-1.5 whitespace-pre-wrap" />
                    ) : msg.role === 'assistant' && msg.content ? (
                      <div className="space-y-1.5">{renderMarkdown(msg.content)}</div>
                    ) : msg.role === 'user' ? (
                      <p className="leading-[1.7]">{msg.content}</p>
                    ) : null}

                    {i === messages.length - 1 && !streaming && msg.role === 'assistant' &&
                      (msg.error || msg.content.includes('busy') || msg.content.includes('try again')) && (
                      <button onClick={retryLast}
                        className="mt-2.5 flex items-center gap-1.5 text-[0.75rem] font-medium text-teal-deep hover:text-teal-dark transition-colors">
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

        {/* Input bar */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 pt-3 pb-4 shadow-[0_-1px_6px_rgba(0,0,0,0.04)]">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 items-end bg-[#f8f9fa] rounded-2xl border border-gray-200 focus-within:border-teal-mid focus-within:bg-white transition-all px-3 py-2">
              <textarea ref={inputRef} rows={1} value={input}
                onChange={autoResize} onKeyDown={handleKey} disabled={streaming}
                placeholder={streaming ? 'Coach is thinking…' : 'Type a message…'}
                className="flex-1 resize-none bg-transparent outline-none text-[0.9rem] text-charcoal placeholder:text-text-xlight py-1.5 disabled:opacity-60"
                style={{ maxHeight: '130px' }}
              />
              <button onClick={() => send(input)} disabled={!input.trim() || streaming}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-teal-deep text-white flex items-center justify-center hover:bg-teal-dark disabled:opacity-35 transition-all mb-0.5">
                {streaming
                  ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 8h12M8 2l6 6-6 6"/>
                    </svg>
                }
              </button>
            </div>

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
