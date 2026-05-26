'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { QUOTES, getDailyQuoteIndex } from '@/lib/quotes'

const AUTO_INTERVAL = 6000 // 6 seconds per quote

export function QuoteSection() {
  const [index, setIndex]   = useState(getDailyQuoteIndex)
  const [fading, setFading] = useState(false)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const go = useCallback((dir: number) => {
    setFading(true)
    setTimeout(() => {
      setIndex(i => (i + dir + QUOTES.length) % QUOTES.length)
      setFading(false)
    }, 300)
  }, [])

  // Auto-advance
  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(() => go(1), AUTO_INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [paused, go])

  function navigate(dir: number) {
    // Pause auto-play for 12 s after manual interaction
    setPaused(true)
    if (timerRef.current) clearInterval(timerRef.current)
    go(dir)
    setTimeout(() => setPaused(false), 12000)
  }

  const q = QUOTES[index]

  return (
    <section className="bg-teal-ghost py-20 px-[5%]">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 text-teal-mid text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4 section-label">
          Today&apos;s Thought
        </div>
        <h2 className="font-display text-[clamp(1.9rem,3vw,2.8rem)] text-charcoal mb-2">
          A little something for your day ☀️
        </h2>

        <div
          className="bg-white rounded-[24px] p-10 max-w-[720px] mx-auto mt-8 shadow-lift border-l-[6px] border-amber relative"
          style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.3s ease' }}
        >
          <span className="font-display text-[6rem] leading-[0.8] text-teal-light/50 absolute top-5 left-5 select-none">&ldquo;</span>
          <p className="font-display text-[1.4rem] italic text-teal-deep leading-relaxed mb-4 pl-4">{q.text}</p>
          <p className="text-[0.9rem] font-semibold text-text-light tracking-widest uppercase">{q.author}</p>
          <span className="inline-block mt-3 bg-teal-ghost text-teal-deep px-3 py-1 rounded-full text-[0.76rem] font-semibold tracking-widest">
            {q.category}
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              onClick={() => navigate(i - index)}
              aria-label={`Go to quote ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === index
                  ? 'w-5 h-2 bg-teal-mid'
                  : 'w-2 h-2 bg-teal-light hover:bg-teal-mid'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={() => navigate(-1)} aria-label="Previous quote"
            className="w-9 h-9 rounded-full border border-teal-light text-teal-deep flex items-center justify-center text-xl leading-none hover:bg-teal-deep hover:text-white hover:border-teal-deep transition-all">
            ‹
          </button>
          <span className="text-[0.82rem] italic text-text-xlight min-w-[60px] text-center">{index + 1} / {QUOTES.length}</span>
          <button onClick={() => navigate(1)} aria-label="Next quote"
            className="w-9 h-9 rounded-full border border-teal-light text-teal-deep flex items-center justify-center text-xl leading-none hover:bg-teal-deep hover:text-white hover:border-teal-deep transition-all">
            ›
          </button>
        </div>
        <p className="text-[0.82rem] text-text-xlight mt-3">
          {paused ? 'Resuming auto-play shortly…' : 'Auto-advancing every few seconds · or browse manually ☀️'}
        </p>
      </div>
    </section>
  )
}
