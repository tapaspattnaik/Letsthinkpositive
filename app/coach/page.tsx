'use client'

import { useState, useRef, useEffect } from 'react'

type Role = 'user' | 'assistant'
interface Message { role: Role; content: string }

const CATEGORIES = [
  { id: 'mood',       label: '😔 Mood',       desc: 'How are you feeling right now?' },
  { id: 'motivation', label: '⚡ Motivation',  desc: 'Find energy and purpose today.' },
  { id: 'reflection', label: '🪞 Reflection',  desc: 'Look back with compassion.' },
  { id: 'calm',       label: '🌬️ Calm',        desc: 'Breathing and grounding.' },
  { id: 'gratitude',  label: '💛 Gratitude',   desc: 'Cultivate appreciation.' },
  { id: 'sleep',      label: '🌙 Sleep',       desc: 'Wind down and rest.' },
]

const STARTER_PROMPTS: Record<string, string[]> = {
  mood: [
    "What's one thing you're proud of yourself for accomplishing today?",
    "Take a few deep breaths. How does your body feel right now?",
    "What emotion is most present for you in this moment?",
  ],
  motivation: [
    "What's one small step you could take today towards something that matters to you?",
    "When did you last feel genuinely energised? What were you doing?",
    "Write down three things you appreciate about yourself.",
  ],
  reflection: [
    "What's one thing that challenged you recently — and what did it teach you?",
    "If you could speak to your younger self today, what would you say?",
    "What's one decision you made recently that you feel good about?",
  ],
  calm: [
    "Let's try box breathing together. Are you ready to begin?",
    "I'm feeling overwhelmed. Can you guide me back to calm?",
    "What's one thing you can see, hear, and feel right now?",
  ],
  gratitude: [
    "What's one small thing from today that you could be grateful for?",
    "Who is someone who has positively influenced your life?",
    "What's something about your body you're grateful for today?",
  ],
  sleep: [
    "I'm struggling to wind down tonight. Can you help?",
    "What's the most stressful thing on your mind right now?",
    "Guide me through a simple bedtime relaxation practice.",
  ],
}

export default function CoachPage() {
  const [activeCategory, setActiveCategory] = useState('mood')
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState('')
  const [streaming, setStreaming] = useState(false)
  const [started, setStarted]     = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  async function send(text: string) {
    if (!text.trim() || streaming) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)
    setStarted(true)

    try {
      const res = await fetch('/api/coach', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: newMessages }),
      })
      if (!res.ok || !res.body) throw new Error('Stream failed')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let aiText = ''
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of decoder.decode(value).split('\n')) {
          if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
          try {
            const { text } = JSON.parse(line.slice(6))
            aiText += text
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = { role: 'assistant', content: aiText }
              return updated
            })
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'I\'m sorry, I couldn\'t connect just now. Please try again in a moment. 🌿' }])
    } finally {
      setStreaming(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  return (
    <>
      {/* Hero */}
      {!started && (
        <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
              <span className="w-6 h-0.5 bg-amber rounded" /> Calm Coach
            </div>
            <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-snug mb-4">
              Your Personalised <em className="italic text-amber-soft">Wellness Companion</em>
            </h1>
            <p className="text-white/72 text-[1.05rem] leading-[1.8] max-w-[560px] mx-auto">
              The Calm Coach provides gentle prompts and support to guide you towards your goals. Choose a category and let&apos;s begin.
            </p>
          </div>
        </section>
      )}

      <div className={`max-w-3xl mx-auto px-[5%] ${started ? 'py-6' : 'py-10'}`}>

        {/* Category Selector */}
        {!started && (
          <div className="mb-8">
            <p className="text-[0.82rem] font-semibold text-text-light uppercase tracking-wider mb-4">Choose a focus area:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <button key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-left p-4 rounded-[18px] border transition-all ${
                    activeCategory === cat.id
                      ? 'bg-teal-deep text-white border-teal-deep'
                      : 'bg-white text-text-mid border-teal-light hover:border-teal-mid hover:bg-teal-ghost'
                  }`}>
                  <span className="font-semibold text-[0.92rem] block mb-0.5">{cat.label}</span>
                  <span className={`text-[0.78rem] ${activeCategory === cat.id ? 'text-white/70' : 'text-text-xlight'}`}>{cat.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Starter Prompts */}
        {!started && (
          <div className="mb-8">
            <p className="text-[0.82rem] font-semibold text-text-light uppercase tracking-wider mb-4">Quick starters:</p>
            <div className="flex flex-col gap-2">
              {(STARTER_PROMPTS[activeCategory] ?? []).map((p, i) => (
                <button key={i} onClick={() => send(p)}
                  className="text-left px-5 py-3.5 bg-white border border-teal-light rounded-[16px] text-[0.9rem] text-text-mid hover:border-teal-mid hover:bg-teal-ghost hover:text-teal-deep transition-all">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Response style note */}
        {!started && (
          <div className="mb-8 bg-teal-ghost border border-teal-light rounded-[16px] px-5 py-4">
            <p className="text-[0.85rem] text-text-mid leading-[1.7]">
              <strong className="text-teal-deep">How the Calm Coach works:</strong>{' '}
              The Coach provides encouraging and validating responses. Use these prompts to explore your feelings and gain insights.
              Sessions are private and not stored.
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="space-y-5 mb-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-teal-mid flex items-center justify-center text-white text-[0.85rem] flex-shrink-0 mt-1 mr-2">🌿</div>
                )}
                <div className={`max-w-[80%] px-5 py-4 rounded-[20px] text-[0.95rem] leading-[1.75] ${
                  msg.role === 'user'
                    ? 'bg-teal-deep text-white rounded-br-sm'
                    : 'bg-white border border-teal-light text-text-mid rounded-bl-sm'
                }`}>
                  {msg.content || (streaming && i === messages.length - 1 ? (
                    <span className="flex gap-1.5 items-center py-1">
                      {[0, 1, 2].map(j => <span key={j} className="w-2 h-2 bg-teal-mid rounded-full animate-bounce" style={{ animationDelay: `${j * 0.15}s` }} />)}
                    </span>
                  ) : '')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div className={`sticky bottom-6 ${started ? 'pt-4' : ''}`}>
          <div className="bg-white border border-teal-light rounded-[20px] shadow-card flex gap-2 p-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={streaming}
              placeholder={started ? "Continue the conversation…" : "Or type your own message…"}
              className="flex-1 resize-none border-none outline-none font-body text-[0.95rem] text-charcoal bg-transparent placeholder:text-text-xlight px-3 py-2.5 max-h-32 disabled:opacity-60"
              style={{ height: 'auto' }}
              onInput={e => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || streaming}
              className="bg-teal-deep text-white rounded-[14px] px-5 py-2.5 font-body font-semibold text-[0.9rem] hover:bg-teal-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end">
              {streaming ? '…' : 'Send'}
            </button>
          </div>
          <p className="text-[0.72rem] text-text-xlight text-center mt-2">
            The Calm Coach is an AI assistant, not a therapist. In crisis, please contact a professional. 🌿
          </p>
        </div>
      </div>
    </>
  )
}
