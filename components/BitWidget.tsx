'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { LtpLogo } from '@/components/ui/LtpLogo'
import { useBitChat } from '@/hooks/useBitChat'

const MOODS = [
  { label: 'Low',      emoji: '😔' },
  { label: 'Okay',     emoji: '😐' },
  { label: 'Good',     emoji: '🙂' },
  { label: 'Great',    emoji: '😊' },
  { label: 'Grateful', emoji: '🌟' },
]

const STARTERS = [
  "I'm feeling overwhelmed",
  "Guide me through breathing",
  "Help me find gratitude",
  "Share a calming thought",
]

export function BitWidget() {
  const [open,   setOpen]   = useState(false)
  const [input,  setInput]  = useState('')
  const [unread, setUnread] = useState(0)
  const widgetRef  = useRef<HTMLDivElement>(null)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)
  const prevCount  = useRef(0)

  const { messages, mood, setMood, streaming, send } = useBitChat()

  // ── Close on outside click ──────────────────────────────────
  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  // ── Scroll + unread counter ─────────────────────────────────
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (!open && messages.length > prevCount.current) {
      const newMsgs = messages.slice(prevCount.current)
      if (newMsgs.some(m => m.role === 'assistant' && m.content)) setUnread(u => u + 1)
    }
    prevCount.current = messages.length
  }, [messages, open])

  const toggle = useCallback(() => {
    setOpen(o => {
      if (!o) {
        setUnread(0)
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'instant' })
          inputRef.current?.focus()
        }, 300)
      }
      return !o
    })
  }, [])

  // ── Pop out to standalone window ────────────────────────────
  function popOut() {
    const w = 420, h = 640
    const left = window.screenX + window.outerWidth  - w - 20
    const top  = window.screenY + window.outerHeight - h - 60
    window.open(
      '/bit-chat',
      'BitChat',
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
    )
    setOpen(false)
  }

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg) return
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    await send(msg)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
  }

  // On mobile: bottom-[76px] sits above the 60px bottom nav + 16px gap.
  // On desktop (lg+): bottom-5 normal position.
  return (
    <div ref={widgetRef} className="fixed bottom-[76px] lg:bottom-5 right-5 z-[999] flex flex-col items-end gap-3 pointer-events-none">

      {/* ── Chat panel ───────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bit — AI wellness companion"
        aria-hidden={!open}
        className={`flex flex-col bg-white rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] border border-teal-light overflow-hidden transition-all duration-300 origin-bottom-right
        ${open
          ? 'opacity-100 scale-100 translate-y-0 w-[88vw] max-w-[380px] h-[70vh] max-h-[540px] pointer-events-auto'
          : 'opacity-0 scale-90 translate-y-4 pointer-events-none w-0 h-0 overflow-hidden'}`}>

        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-teal-light bg-gradient-to-r from-teal-deep to-teal-dark flex-shrink-0">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <LtpLogo size={22} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-teal-light border-2 border-teal-dark" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-[0.87rem] leading-none">Bit</p>
            <p className="text-white/60 text-[0.68rem]">AI companion · always here</p>
          </div>
          {/* Pop-out button */}
          <button onClick={popOut} title="Open in new window"
            className="text-white/60 hover:text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Pop out to new window">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 2H2v10h10V9M8 2h4m0 0v4m0-4L6 8"/>
            </svg>
          </button>
          {/* Close button */}
          <button onClick={toggle}
            className="text-white/60 hover:text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-[0.9rem] flex-shrink-0"
            aria-label="Close chat">
            ✕
          </button>
        </div>

        {/* Mood bar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-teal-light/50 flex-shrink-0 bg-teal-ghost/20">
          <span className="text-[0.65rem] text-text-xlight mr-1 font-medium">Mood:</span>
          {MOODS.map(m => (
            <button key={m.label} onClick={() => setMood(mood === m.label ? '' : m.label)}
              aria-pressed={mood === m.label}
              aria-label={`Set mood: ${m.label}`}
              className={`text-[0.95rem] rounded-full p-0.5 transition-all min-w-[28px] min-h-[28px] flex items-center justify-center ${mood === m.label ? 'bg-teal-deep scale-110' : 'hover:bg-teal-ghost'}`}>
              {m.emoji}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
          {messages.length === 0 && (
            <div className="text-center py-4">
              <LtpLogo size={36} />
              <p className="text-[0.82rem] text-text-mid mt-2 mb-3 leading-[1.6]">
                Hi, I&apos;m <strong className="text-teal-deep">Bit</strong> — your calm companion. What&apos;s on your mind?
              </p>
              <div className="space-y-1.5">
                {STARTERS.map(s => (
                  <button key={s} onClick={() => handleSend(s)}
                    className="w-full text-left text-[0.77rem] text-text-mid px-3 py-2 rounded-[10px] border border-teal-light hover:bg-teal-ghost hover:text-teal-deep hover:border-teal-mid transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {m.role === 'assistant' && (
                <div className="flex-shrink-0 w-[20px] h-[20px] rounded-full bg-teal-ghost flex items-center justify-center mt-1">
                  <LtpLogo size={14} />
                </div>
              )}
              <div className={`max-w-[82%] px-3 py-2 text-[0.82rem] leading-[1.75] rounded-[14px] ${
                m.role === 'user'
                  ? 'bg-teal-deep text-white rounded-tr-sm'
                  : 'bg-teal-ghost text-text-mid rounded-tl-sm'
              }`}>
                {m.content || (streaming && i === messages.length - 1
                  ? <span className="inline-flex gap-1 items-center">
                      {[0,150,300].map(d => <span key={d} className="w-1 h-1 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                    </span>
                  : '')}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-teal-light px-3 py-2.5 bg-white">
          <div className="flex gap-2 items-end">
            <label htmlFor="bit-input" className="sr-only">Message Bit</label>
            <textarea id="bit-input" ref={inputRef} value={input} onChange={autoResize} onKeyDown={handleKey}
              placeholder="Message Bit…" rows={1}
              aria-label="Message Bit"
              className="flex-1 border border-teal-light rounded-[12px] px-3 py-2 text-[0.82rem] text-charcoal bg-ivory outline-none focus:border-teal-mid transition-colors resize-none placeholder:text-text-xlight leading-[1.5]"
              style={{ maxHeight: '100px' }} />
            <button onClick={() => handleSend()} disabled={!input.trim() || streaming}
              aria-label="Send message"
              className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-deep text-white flex items-center justify-center hover:bg-teal-dark disabled:opacity-40 transition-all">
              {streaming
                ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2 7h10M7 2l5 5-5 5"/></svg>
              }
            </button>
          </div>
          <p className="text-[0.62rem] text-text-xlight mt-1.5 text-center">Not a therapist · for support seek a professional</p>
        </div>
      </div>

      {/* ── Floating toggle button ────────────────── */}
      <button onClick={toggle}
        aria-label={open ? 'Close Bit chat' : 'Open Bit chat'}
        className={`pointer-events-auto relative w-14 h-14 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.20)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95
          ${open ? 'bg-teal-dark' : 'bg-teal-deep'}`}>
        {!open && <span className="absolute inset-0 rounded-full bg-teal-mid/30 animate-ping" />}
        <div className={`transition-transform duration-300 ${open ? 'rotate-90 scale-90' : ''}`}>
          {open
            ? <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M6 14L14 6"/></svg>
            : <LtpLogo size={28} />
          }
        </div>
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber text-charcoal text-[0.65rem] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </div>
  )
}
