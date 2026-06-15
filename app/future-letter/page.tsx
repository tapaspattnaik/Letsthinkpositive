'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function FutureLetterPage() {
  const { status } = useSession()
  const [letter,      setLetter]      = useState<string | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [cached,      setCached]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [regenerating,setRegenerating]= useState(false)
  const [sharing,     setSharing]     = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  function load() {
    if (status !== 'authenticated') return
    setLoading(true); setError(null)
    fetch('/api/future-letter')
      .then(r => r.json())
      .then(d => {
        if (d.letter) { setLetter(d.letter); setCached(d.cached) }
        else setError(d.error ?? 'Could not generate letter.')
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  async function regenerate() {
    setRegenerating(true)
    await fetch('/api/future-letter', { method: 'DELETE' })
    setLetter(null)
    load()
    setRegenerating(false)
  }

  async function shareAsImage() {
    if (!cardRef.current) return
    setSharing(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null })
      canvas.toBlob(async blob => {
        if (!blob) return
        try {
          await navigator.share({ files: [new File([blob], 'letter-from-future.png', { type: 'image/png' })] })
        } catch {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a'); a.href = url; a.download = 'letter-from-future.png'; a.click()
          URL.revokeObjectURL(url)
        }
        setSharing(false)
      }, 'image/png')
    } catch {
      setSharing(false)
    }
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <p className="text-[1.1rem] text-text-mid mb-4">Sign in to receive your letter.</p>
        <Link href="/login" className="bg-teal-deep text-white px-6 py-2.5 rounded-full font-semibold hover:bg-teal-dark transition-colors no-underline">Sign in →</Link>
      </div>
    )
  }

  const paragraphs = letter?.split('\n').filter(Boolean) ?? []

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white text-center">
        <p className="text-amber text-[0.72rem] font-bold uppercase tracking-widest mb-3">A personal gift</p>
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold mb-4">Letter from Your Future Self 💌</h1>
        <p className="text-white/70 text-[1.05rem] max-w-[520px] mx-auto">
          One year from now, looking back at everything you&apos;ve built — here&apos;s what you want yourself to know today.
        </p>
      </section>

      <section className="py-14 px-[5%]">
        <div className="max-w-2xl mx-auto">

          {loading && (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-teal-light border-t-teal-deep rounded-full animate-spin mb-4" />
              <p className="text-text-mid text-[0.9rem]">Writing your letter with care…</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-16">
              <p className="text-rose-500 mb-4">{error}</p>
              <button onClick={load} className="bg-teal-deep text-white px-6 py-2.5 rounded-full font-semibold hover:bg-teal-dark transition-colors">
                Try again
              </button>
            </div>
          )}

          {letter && !loading && (
            <>
              {/* Letter card */}
              <div ref={cardRef}
                className="bg-gradient-to-br from-amber-pale via-white to-teal-ghost/40 border border-amber/30 rounded-[28px] p-8 shadow-lift mb-6"
                style={{ fontFamily: 'Georgia, serif' }}>

                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-amber/20">
                  <span className="text-[1.8rem]">💌</span>
                  <div>
                    <p className="font-bold text-teal-deep text-[0.78rem] uppercase tracking-widest">From your future self</p>
                    <p className="text-text-xlight text-[0.72rem]">One year from now · letsthinkpositive.com</p>
                  </div>
                  {cached && (
                    <span className="ml-auto text-[0.65rem] font-semibold bg-teal-ghost text-teal-deep px-2.5 py-0.5 rounded-full">
                      This month&apos;s letter
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="text-charcoal text-[1rem] leading-[1.85] text-justify">{p}</p>
                  ))}
                </div>

                <div className="mt-8 pt-5 border-t border-amber/20 text-right">
                  <p className="font-display italic text-teal-deep text-[1.05rem]">With love and pride,</p>
                  <p className="font-display italic text-teal-deep text-[0.9rem] mt-1">Your future self 🌿</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-center mb-10">
                <button onClick={shareAsImage} disabled={sharing}
                  className="flex items-center gap-2 bg-teal-deep text-white px-6 py-2.5 rounded-full font-semibold hover:bg-teal-dark transition-colors disabled:opacity-60">
                  {sharing ? 'Saving…' : '📸 Save / Share'}
                </button>
                <button onClick={regenerate} disabled={regenerating}
                  className="flex items-center gap-2 border border-teal-light text-teal-deep px-6 py-2.5 rounded-full font-semibold hover:bg-teal-ghost transition-colors disabled:opacity-60">
                  {regenerating ? 'Writing…' : '✨ Write new letter'}
                </button>
                <Link href="/journal"
                  className="flex items-center gap-2 border border-teal-light text-text-mid px-6 py-2.5 rounded-full font-semibold hover:border-teal-mid hover:text-teal-deep transition-colors no-underline">
                  📓 Add to journal
                </Link>
              </div>

              {/* Info box */}
              <div className="bg-teal-ghost rounded-[20px] p-5 text-center">
                <p className="text-teal-deep text-[0.82rem] leading-[1.7]">
                  Your letter is personal to you — generated from your mood patterns, streaks, challenges, and interests.
                  A new letter is written each month as you grow. <strong>The more you log, the richer it gets.</strong>
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
