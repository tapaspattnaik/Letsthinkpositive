'use client'

import { useState, useRef, useCallback } from 'react'

// Lazy-load html2canvas (~150 KiB) only when the user exports a card
const loadHtml2Canvas = () => import('html2canvas').then(m => m.default)

// ── Birthday card themes ─────────────────────────────────────────────────────
interface Theme {
  id: string; label: string; swatch: string
  cardBg: string; textColor: string; accent: string; confetti: string[]
}
const THEMES: Theme[] = [
  { id: 'festive',  label: 'Festive',     swatch: 'bg-gradient-to-br from-[#7B2FF7] to-[#F107A3]', cardBg: 'linear-gradient(135deg,#7B2FF7,#F107A3)', textColor: '#fff',     accent: '#FFE45E', confetti: ['#FFE45E','#5EE7DF','#FF6B6B','#fff'] },
  { id: 'golden',   label: 'Golden',      swatch: 'bg-gradient-to-br from-[#E8A020] to-[#F5C96A]', cardBg: 'linear-gradient(135deg,#E8A020,#F5C96A)', textColor: '#1C2B2B', accent: '#7B2FF7', confetti: ['#7B2FF7','#fff','#1A6B6B','#F107A3'] },
  { id: 'teal',     label: 'Calm Teal',   swatch: 'bg-gradient-to-br from-[#0F4040] to-[#1A6B6B]', cardBg: 'linear-gradient(135deg,#0F4040,#1A6B6B)', textColor: '#fff',     accent: '#F5C96A', confetti: ['#F5C96A','#5EE7DF','#fff','#A8D8D0'] },
  { id: 'pink',     label: 'Sweet Pink',  swatch: 'bg-gradient-to-br from-[#ff9a9e] to-[#fad0c4]', cardBg: 'linear-gradient(135deg,#ff9a9e,#fad0c4)', textColor: '#7a1f4a', accent: '#7a1f4a', confetti: ['#fff','#ffd166','#ef476f','#7a1f4a'] },
  { id: 'sky',      label: 'Sky',         swatch: 'bg-gradient-to-br from-[#0093E9] to-[#80D0C7]', cardBg: 'linear-gradient(135deg,#0093E9,#80D0C7)', textColor: '#fff',     accent: '#FFE45E', confetti: ['#FFE45E','#fff','#FF6B6B','#5EE7DF'] },
  { id: 'midnight', label: 'Midnight',    swatch: 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e]', cardBg: 'linear-gradient(135deg,#1a1a2e,#16213e)', textColor: '#fff',     accent: '#F5C96A', confetti: ['#F5C96A','#5EE7DF','#F107A3','#fff'] },
]

const TONES = ['heartfelt', 'funny', 'inspirational', 'poetic', 'short & sweet'] as const
type Tone = (typeof TONES)[number]

const RELATIONSHIPS = ['friend', 'mom', 'dad', 'sister', 'brother', 'partner', 'colleague', 'best friend', 'daughter', 'son', 'grandma', 'grandpa']

// Deterministic confetti positions so SSR/render is stable
const CONFETTI_DOTS = Array.from({ length: 28 }, (_, i) => ({
  left:  (i * 37) % 100,
  top:   (i * 53) % 100,
  size:  6 + (i % 4) * 2,
  rot:   (i * 47) % 360,
  ci:    i % 4,
}))

export default function BirthdayCardPage() {
  const [recipientName, setRecipientName] = useState('')
  const [relationship,  setRelationship]  = useState('friend')
  const [age,           setAge]           = useState('')
  const [traits,        setTraits]        = useState('')
  const [tone,          setTone]          = useState<Tone>('heartfelt')
  const [message,       setMessage]       = useState('')
  const [themeId,       setThemeId]       = useState(THEMES[0].id)
  const [loading,       setLoading]       = useState(false)
  const [downloading,   setDownloading]   = useState(false)
  const [step,          setStep]          = useState<1 | 2>(1)
  const cardRef = useRef<HTMLDivElement>(null)

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0]

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai-birthday-message', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientName, relationship, tone, age, traits }),
      })
      const d = await res.json()
      if (d.message) { setMessage(d.message); setStep(2) }
    } catch {
      setMessage('Happy Birthday! Wishing you a day full of joy and a year full of blessings. 🎂')
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const html2canvas = await loadHtml2Canvas()
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null, logging: false })
      const link = document.createElement('a')
      link.download = `birthday-card${recipientName ? '-' + recipientName.replace(/\s+/g, '-').toLowerCase() : ''}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch { /* noop */ }
    setDownloading(false)
  }, [recipientName])

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return
    try {
      const html2canvas = await loadHtml2Canvas()
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, logging: false })
      canvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], 'birthday-card.png', { type: 'image/png' })
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Happy Birthday!', text: message })
        } else { handleDownload() }
      }, 'image/png')
    } catch { handleDownload() }
  }, [message, handleDownload])

  const fontSize = message.length > 240 ? '0.95rem' : message.length > 140 ? '1.08rem' : '1.2rem'

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#7B2FF7] to-[#1A6B6B] py-16 px-[5%] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true">
          {CONFETTI_DOTS.slice(0, 16).map((d, i) => (
            <span key={i} style={{ position: 'absolute', left: `${d.left}%`, top: `${d.top}%`, fontSize: `${d.size + 8}px` }}>
              {['🎉','🎈','✨','🎂'][d.ci]}
            </span>
          ))}
        </div>
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold mb-3 relative">AI Birthday Card Generator 🎂</h1>
        <p className="text-white/80 text-[1.05rem] max-w-[520px] mx-auto relative">
          Tell us a little about them — AI writes a heartfelt, funny, or poetic message, then pick a design and share it free.
        </p>
      </section>

      <section className="py-12 px-[5%]">
        <div className="max-w-3xl mx-auto">

          {/* ── Step 1: details ─────────────────────────────────── */}
          {step === 1 && (
            <div className="bg-white rounded-[24px] border border-teal-light shadow-card p-6 sm:p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="bd-name" className="block text-[0.85rem] font-semibold text-teal-deep mb-2">Who is it for?</label>
                  <input id="bd-name" type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)}
                    placeholder="e.g. Priya"
                    className="w-full border border-teal-light rounded-full px-5 py-2.5 text-[0.95rem] text-charcoal outline-none focus:border-teal-mid transition-colors" />
                </div>
                <div>
                  <label htmlFor="bd-rel" className="block text-[0.85rem] font-semibold text-teal-deep mb-2">Your relationship</label>
                  <input id="bd-rel" list="bd-rel-list" value={relationship} onChange={e => setRelationship(e.target.value)}
                    placeholder="friend"
                    className="w-full border border-teal-light rounded-full px-5 py-2.5 text-[0.95rem] text-charcoal outline-none focus:border-teal-mid transition-colors" />
                  <datalist id="bd-rel-list">
                    {RELATIONSHIPS.map(r => <option key={r} value={r} />)}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-[0.85rem] font-semibold text-teal-deep mb-2">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map(t => (
                    <button key={t} onClick={() => setTone(t)}
                      className={`px-4 py-1.5 rounded-full border text-[0.85rem] capitalize transition-all
                        ${tone === t ? 'bg-teal-deep text-white border-teal-deep' : 'bg-white text-text-mid border-teal-light hover:border-teal-mid'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="bd-age" className="block text-[0.85rem] font-semibold text-teal-deep mb-2">Age <span className="text-text-xlight font-normal">(optional)</span></label>
                  <input id="bd-age" type="text" inputMode="numeric" value={age} onChange={e => setAge(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="e.g. 30"
                    className="w-full border border-teal-light rounded-full px-5 py-2.5 text-[0.95rem] text-charcoal outline-none focus:border-teal-mid transition-colors" />
                </div>
                <div>
                  <label htmlFor="bd-traits" className="block text-[0.85rem] font-semibold text-teal-deep mb-2">Anything to mention? <span className="text-text-xlight font-normal">(optional)</span></label>
                  <input id="bd-traits" type="text" value={traits} onChange={e => setTraits(e.target.value.slice(0, 200))}
                    placeholder="loves hiking, always kind…"
                    className="w-full border border-teal-light rounded-full px-5 py-2.5 text-[0.95rem] text-charcoal outline-none focus:border-teal-mid transition-colors" />
                </div>
              </div>

              <button onClick={generate} disabled={loading}
                className="w-full bg-teal-deep text-white py-3.5 rounded-full font-semibold text-[0.97rem] hover:bg-teal-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? 'Writing your message…' : '✨ Generate Birthday Message'}
              </button>
            </div>
          )}

          {/* ── Step 2: card preview + customise ─────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Card preview */}
              <div className="flex justify-center">
                <div ref={cardRef}
                  style={{ background: theme.cardBg, color: theme.textColor, width: '440px', maxWidth: '100%' }}
                  className="relative rounded-[24px] p-8 sm:p-10 shadow-lift overflow-hidden aspect-[4/5] flex flex-col items-center justify-center text-center">
                  {/* Confetti */}
                  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    {CONFETTI_DOTS.map((d, i) => (
                      <span key={i} style={{
                        position: 'absolute', left: `${d.left}%`, top: `${d.top}%`,
                        width: `${d.size}px`, height: `${d.size}px`, borderRadius: i % 3 === 0 ? '50%' : '2px',
                        background: theme.confetti[d.ci], transform: `rotate(${d.rot}deg)`, opacity: 0.55,
                      }} />
                    ))}
                  </div>

                  <p style={{ color: theme.accent }} className="font-display text-[0.78rem] font-bold uppercase tracking-[0.2em] mb-2 relative">Happy Birthday</p>
                  {recipientName && (
                    <h2 className="font-display text-[2rem] font-bold leading-tight mb-4 relative">{recipientName}!</h2>
                  )}
                  <p style={{ fontSize, lineHeight: 1.7 }} className="font-body whitespace-pre-wrap relative">{message}</p>
                  <p style={{ color: theme.accent }} className="mt-5 text-[1.4rem] relative">🎂🎈🎉</p>
                </div>
              </div>

              {/* Editable message */}
              <div className="bg-white rounded-[20px] border border-teal-light p-5">
                <label htmlFor="bd-msg" className="block text-[0.78rem] font-bold text-teal-mid uppercase tracking-widest mb-2">Message — tweak it your way</label>
                <textarea id="bd-msg" value={message} onChange={e => setMessage(e.target.value)} rows={4}
                  className="w-full border border-teal-light rounded-[16px] px-4 py-3 text-[0.92rem] text-charcoal outline-none focus:border-teal-mid transition-colors resize-none" />
                <button onClick={generate} disabled={loading}
                  className="mt-2 text-[0.82rem] font-semibold text-teal-mid hover:text-teal-deep transition-colors">
                  {loading ? 'Rewriting…' : '✨ Generate a different message'}
                </button>
              </div>

              {/* Theme picker */}
              <div className="bg-white rounded-[20px] border border-teal-light p-5">
                <p className="text-[0.78rem] font-bold text-teal-mid uppercase tracking-widest mb-3">Design</p>
                <div className="flex flex-wrap gap-3">
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => setThemeId(t.id)} aria-label={`${t.label} theme`}
                      className={`w-12 h-12 rounded-full ${t.swatch} transition-all ${themeId === t.id ? 'ring-3 ring-teal-deep ring-offset-2 scale-110' : 'hover:scale-105'}`} />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button onClick={handleDownload} disabled={downloading}
                  className="flex items-center gap-2 bg-teal-deep text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-dark transition-colors disabled:opacity-60">
                  {downloading ? 'Saving…' : '⬇️ Download Card'}
                </button>
                <button onClick={handleShare}
                  className="flex items-center gap-2 border border-teal-light text-teal-deep px-6 py-3 rounded-full font-semibold hover:bg-teal-ghost transition-colors">
                  📤 Share
                </button>
                <button onClick={() => setStep(1)}
                  className="flex items-center gap-2 border border-teal-light text-text-mid px-6 py-3 rounded-full font-semibold hover:border-teal-mid hover:text-teal-deep transition-colors">
                  ← Start over
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
