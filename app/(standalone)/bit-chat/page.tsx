'use client'

import { useState, useRef, useEffect } from 'react'
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

export default function BitChatPage() {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  const { messages, mood, setMood, streaming, send, clear } = useBitChat()

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

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
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-teal-light bg-gradient-to-r from-teal-deep to-teal-dark flex-shrink-0">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <LtpLogo size={24} />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-teal-light border-2 border-teal-dark" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-[0.92rem] leading-none">Bit</p>
          <p className="text-white/60 text-[0.7rem]">AI companion · always here</p>
        </div>
        <button
          onClick={clear}
          title="Clear conversation"
          className="text-white/60 hover:text-white text-[0.72rem] font-medium px-2.5 py-1 rounded-full border border-white/20 hover:border-white/40 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* ── Mood bar ── */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-teal-light/50 flex-shrink-0 bg-teal-ghost/20">
        <span className="text-[0.65rem] text-text-xlight mr-1 font-medium">Mood:</span>
        {MOODS.map(m => (
          <button
            key={m.label}
            onClick={() => setMood(mood === m.label ? '' : m.label)}
            title={m.label}
            className={`text-[1rem] rounded-full p-1 transition-all ${mood === m.label ? 'bg-teal-deep scale-110' : 'hover:bg-teal-ghost'}`}
          >
            {m.emoji}
          </button>
        ))}
        {mood && (
          <span className="ml-auto text-[0.7rem] text-teal-deep font-medium bg-teal-ghost px-2 py-0.5 rounded-full">
            {mood}
          </span>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-8">
            <LtpLogo size={48} />
            <p className="text-[0.9rem] text-text-mid mt-3 mb-5 leading-[1.7] max-w-[300px]">
              Hi, I&apos;m <strong className="text-teal-deep">Bit</strong> — your calm companion.
              What&apos;s on your mind?
            </p>
            <div className="space-y-2 w-full max-w-[340px]">
              {STARTERS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="w-full text-left text-[0.83rem] text-text-mid px-4 py-2.5 rounded-[12px] border border-teal-light hover:bg-teal-ghost hover:text-teal-deep hover:border-teal-mid transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {m.role === 'assistant' && (
              <div className="flex-shrink-0 w-[24px] h-[24px] rounded-full bg-teal-ghost flex items-center justify-center mt-1">
                <LtpLogo size={16} />
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-2.5 text-[0.87rem] leading-[1.8] rounded-[16px] ${
              m.role === 'user'
                ? 'bg-teal-deep text-white rounded-tr-sm'
                : 'bg-teal-ghost text-text-mid rounded-tl-sm'
            }`}>
              {m.content || (streaming && i === messages.length - 1
                ? <span className="inline-flex gap-1 items-center py-0.5">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </span>
                : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 border-t border-teal-light px-4 py-3 bg-white">
        <div className="flex gap-2.5 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={autoResize}
            onKeyDown={handleKey}
            placeholder="Message Bit…"
            rows={1}
            className="flex-1 border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.87rem] text-charcoal bg-ivory outline-none focus:border-teal-mid transition-colors resize-none placeholder:text-text-xlight leading-[1.5]"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || streaming}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-teal-deep text-white flex items-center justify-center hover:bg-teal-dark disabled:opacity-40 transition-all"
          >
            {streaming
              ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 7h10M7 2l5 5-5 5"/>
                </svg>
            }
          </button>
        </div>
        <p className="text-[0.62rem] text-text-xlight mt-2 text-center">
          Not a therapist · for support seek a professional
        </p>
      </div>
    </div>
  )
}
