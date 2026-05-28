'use client'

import { useState, useRef } from 'react'

const MAX_CHARS = 400

const EXAMPLES = [
  "I always mess things up",
  "Nobody really cares about me",
  "I'll never get better at this",
]

export default function ReframePage() {
  const [thought,    setThought]    = useState('')
  const [response,   setResponse]   = useState('')
  const [streaming,  setStreaming]  = useState(false)
  const [copied,     setCopied]     = useState(false)
  const [hasResult,  setHasResult]  = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSubmit() {
    const trimmed = thought.trim()
    if (!trimmed || streaming) return

    setResponse('')
    setHasResult(false)
    setStreaming(true)
    setCopied(false)

    try {
      const res = await fetch('/api/reframe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ thought: trimmed }),
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
              setResponse(accumulated)
            }
          } catch { /* skip malformed */ }
        }
      }

      if (!accumulated) {
        setResponse("Something went quiet — please try again.")
      }
      setHasResult(true)
    } catch (err) {
      console.error('Reframe error:', err)
      setResponse("Couldn't connect right now. Please try again in a moment.")
      setHasResult(true)
    } finally {
      setStreaming(false)
    }
  }

  function handleReset() {
    setThought('')
    setResponse('')
    setHasResult(false)
    setCopied(false)
    setTimeout(() => textareaRef.current?.focus(), 80)
  }

  async function handleCopy() {
    if (!response) return
    await navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleExampleClick(example: string) {
    setThought(example)
    setResponse('')
    setHasResult(false)
    setTimeout(() => textareaRef.current?.focus(), 80)
  }

  const charsLeft = MAX_CHARS - thought.length
  const canSubmit = thought.trim().length > 0 && !streaming

  // Format response: bold **...** markers rendered as <strong>
  function renderResponse(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-teal-deep">{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="min-h-screen bg-ivory">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-teal-dark via-teal-deep to-teal-mid py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-teal-light text-[0.78rem] font-semibold tracking-[0.18em] uppercase mb-3">
            CBT-Based Tool
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Reframe Your Thoughts
          </h1>
          <p className="text-teal-light/90 text-[1rem] leading-[1.75] max-w-[520px] mx-auto">
            Share a negative or anxious thought and receive a compassionate, evidence-based reframe using Cognitive Behavioural Therapy techniques.
          </p>
        </div>
      </section>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">

        {/* ── Example chips ─────────────────────────────────── */}
        <div>
          <p className="text-[0.72rem] font-bold text-text-xlight tracking-[0.14em] uppercase mb-3">
            Try an example
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => handleExampleClick(ex)}
                disabled={streaming}
                className="text-[0.82rem] text-text-mid bg-white border border-teal-light hover:bg-teal-ghost hover:text-teal-deep hover:border-teal-mid px-4 py-2 rounded-full transition-all disabled:opacity-50"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* ── Input card ────────────────────────────────────── */}
        <div className="bg-white rounded-[20px] shadow-card border border-teal-light/50 p-6 sm:p-8">
          <label
            htmlFor="thought-input"
            className="block text-[0.82rem] font-semibold text-text-mid tracking-wide mb-3"
          >
            What thought is weighing on you?
          </label>

          <div className="relative">
            <textarea
              id="thought-input"
              ref={textareaRef}
              rows={4}
              value={thought}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) setThought(e.target.value)
              }}
              disabled={streaming}
              placeholder="e.g. I always let everyone down…"
              className="w-full resize-none border border-teal-light rounded-[14px] outline-none text-[0.95rem] text-charcoal bg-ivory placeholder:text-text-xlight px-4 py-3.5 focus:border-teal-mid transition-colors disabled:opacity-60 leading-[1.7]"
            />
            <span className={`absolute bottom-3 right-4 text-[0.72rem] ${charsLeft < 50 ? 'text-amber' : 'text-text-xlight'}`}>
              {charsLeft}
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="mt-4 w-full py-3.5 rounded-[14px] bg-teal-deep text-white font-semibold text-[0.95rem] hover:bg-teal-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {streaming ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Reframing…
              </>
            ) : (
              'Reframe this thought →'
            )}
          </button>
        </div>

        {/* ── Response card ─────────────────────────────────── */}
        {(response || streaming) && (
          <div className="bg-teal-ghost border-l-4 border-amber rounded-r-[16px] rounded-l-sm px-6 py-6 shadow-sm">
            {response ? (
              <>
                <p className="text-[0.95rem] text-charcoal leading-[1.85] whitespace-pre-wrap">
                  {renderResponse(response)}
                  {streaming && (
                    <span className="inline-flex gap-1 ml-1.5 align-middle">
                      {[0, 1, 2].map(j => (
                        <span
                          key={j}
                          className="w-1.5 h-1.5 bg-teal-mid rounded-full animate-bounce"
                          style={{ animationDelay: `${j * 150}ms` }}
                        />
                      ))}
                    </span>
                  )}
                </p>

                {/* Action buttons — shown only once streaming is done */}
                {hasResult && !streaming && (
                  <div className="flex gap-3 mt-5 pt-4 border-t border-teal-light/60">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-2.5 rounded-[12px] border border-teal-light text-text-mid text-[0.85rem] font-medium hover:bg-teal-ghost hover:text-teal-deep hover:border-teal-mid transition-all"
                    >
                      Try another thought
                    </button>
                    <button
                      onClick={handleCopy}
                      className={`flex-1 py-2.5 rounded-[12px] text-[0.85rem] font-medium transition-all ${
                        copied
                          ? 'bg-teal-deep text-white'
                          : 'border border-teal-light text-text-mid hover:bg-teal-ghost hover:text-teal-deep hover:border-teal-mid'
                      }`}
                    >
                      {copied ? 'Copied!' : 'Copy reframe'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Loading dots before first token arrives */
              <span className="flex gap-2 items-center py-1">
                {[0, 1, 2].map(j => (
                  <span
                    key={j}
                    className="w-2 h-2 bg-teal-mid rounded-full animate-bounce"
                    style={{ animationDelay: `${j * 150}ms` }}
                  />
                ))}
              </span>
            )}
          </div>
        )}

        {/* ── Disclaimer ────────────────────────────────────── */}
        <p className="text-[0.75rem] text-text-xlight text-center leading-[1.7] px-4">
          This is not therapy. For serious concerns, please speak with a mental health professional.
        </p>

      </div>
    </div>
  )
}
