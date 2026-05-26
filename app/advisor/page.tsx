'use client'

import { useState, useRef, useEffect } from 'react'
import { LtpLogo } from '@/components/ui/LtpLogo'

interface Message { role: 'user' | 'assistant'; content: string }

const MOODS = ['😔 Low', '😐 Okay', '🙂 Good', '😊 Great', '🌟 Grateful']

const STARTERS = [
  "I'm feeling overwhelmed today",
  "Guide me through a short meditation",
  "I need some perspective on a tough situation",
  "Share some wisdom about letting go",
  "Help me find things to be grateful for",
]

export default function AdvisorPage() {
  const [messages,    setMessages]    = useState<Message[]>([])
  const [input,       setInput]       = useState('')
  const [mood,        setMood]        = useState('')
  const [streaming,   setStreaming]   = useState(false)
  const [started,     setStarted]     = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || streaming) return
    setInput('')
    const userMsg: Message = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setStreaming(true)
    setStarted(true)

    const all = [...messages, userMsg]
    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: all, mood }),
      })

      if (!res.body) throw new Error('No stream')
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        // parse SSE lines
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const { text } = JSON.parse(data)
              accumulated += text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: accumulated }
                return updated
              })
            } catch { /* skip malformed */ }
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'I\'m sorry, something went wrong. Please try again in a moment.' }
        return updated
      })
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-teal-light px-[5%] py-4 flex items-center gap-4">
        <LtpLogo size={36} />
        <div>
          <h1 className="font-body font-bold text-[1.05rem] text-teal-deep leading-none">Bit Advisor</h1>
          <p className="text-[0.78rem] text-text-xlight">Your compassionate AI companion</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-mid animate-pulse" />
          <span className="text-[0.78rem] text-text-xlight">Ready</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-[5%] py-8">
        <div className="max-w-2xl mx-auto">
          {!started && (
            <div className="text-center mb-10">
              {/* Mood check-in */}
              <div className="bg-white rounded-[24px] p-7 shadow-card border border-teal-light mb-6">
                <p className="text-[0.85rem] font-semibold text-teal-deep mb-3">How are you feeling right now?</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {MOODS.map(m => (
                    <button key={m} onClick={() => setMood(mood === m ? '' : m)}
                      className={`px-4 py-1.5 rounded-full border text-[0.85rem] transition-all
                        ${mood === m ? 'bg-teal-deep text-white border-teal-deep' : 'bg-teal-ghost text-text-mid border-teal-light hover:border-teal-mid'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Greeting */}
              <div className="bg-white rounded-[24px] p-7 shadow-card border border-teal-light text-left mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <LtpLogo size={30} />
                  <div>
                    <p className="text-[0.78rem] font-semibold text-teal-mid mb-1">Bit</p>
                    <p className="text-[0.97rem] text-text-mid leading-[1.8]">
                      Hello 🌿 I&apos;m Bit — a calm, compassionate companion here to listen, reflect, and offer guidance. Whether you need to talk something through, find some peace, or just hear a kind word — I&apos;m here. What&apos;s on your mind?
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick starters */}
              <p className="text-[0.82rem] text-text-xlight mb-3">Or try one of these:</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {STARTERS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="bg-white border border-teal-light text-text-mid text-[0.83rem] px-4 py-2 rounded-full hover:border-teal-mid hover:text-teal-deep transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {m.role === 'assistant' && <LtpLogo size={28} />}
                <div className={`max-w-[80%] rounded-[20px] px-5 py-4 text-[0.95rem] leading-[1.8] ${
                  m.role === 'user'
                    ? 'bg-teal-deep text-white rounded-br-sm'
                    : 'bg-white border border-teal-light text-text-mid rounded-bl-sm shadow-card'
                }`}>
                  {m.content || (streaming && i === messages.length - 1
                    ? <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-light animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-light animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-light animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    : '')}
                </div>
              </div>
            ))}
          </div>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-teal-light px-[5%] py-4">
        <div className="max-w-2xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Share what's on your mind…"
            rows={1}
            className="flex-1 border border-teal-light rounded-[20px] px-5 py-3 text-[0.95rem] text-charcoal bg-ivory outline-none focus:border-teal-mid transition-colors resize-none placeholder:text-text-xlight leading-[1.6]"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
          <button onClick={() => send()} disabled={!input.trim() || streaming}
            className="bg-teal-deep text-white px-6 py-3 rounded-full font-semibold text-[0.9rem] hover:bg-teal-dark disabled:opacity-50 transition-colors flex-shrink-0">
            {streaming ? '…' : 'Send'}
          </button>
        </div>
        <p className="text-center text-[0.75rem] text-text-xlight mt-2">
          Bit is an AI companion, not a therapist. For serious mental health concerns, please seek professional support.
        </p>
      </div>
    </div>
  )
}
