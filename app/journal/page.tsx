'use client'

import { useState, useEffect } from 'react'

interface Entry {
  id:      string
  date:    string
  prompt:  string
  text:    string
  mood:    string
}

const MOODS = ['🌟 Grateful', '😌 Calm', '🌱 Hopeful', '💪 Strong', '😔 Struggling', '🌈 Joyful']

const PROMPTS = [
  'What are three things that made you smile today?',
  'Who is someone you are grateful for, and why?',
  'What is a small win you had today — even a tiny one?',
  'What is something beautiful you noticed today?',
  'What challenge taught you something this week?',
  'Name one thing about yourself you appreciate.',
  'What moment today brought you peace?',
  'What are you looking forward to tomorrow?',
]

function todayStr() { return new Date().toISOString().split('T')[0] }

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [text, setText]       = useState('')
  const [mood, setMood]       = useState('')
  const [saved, setSaved]     = useState(false)

  const prompt = PROMPTS[new Date().getDay() % PROMPTS.length]

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ltp_journal')
      if (stored) setEntries(JSON.parse(stored))
    } catch { /* noop */ }
  }, [])

  function save() {
    if (!text.trim()) return
    const entry: Entry = { id: Date.now().toString(), date: todayStr(), prompt, text, mood }
    const updated = [entry, ...entries]
    setEntries(updated)
    localStorage.setItem('ltp_journal', JSON.stringify(updated))
    setText('')
    setMood('')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-16 px-[5%] text-white text-center">
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold mb-3">Gratitude Journal 📓</h1>
        <p className="text-white/70 text-[1.05rem] max-w-[480px] mx-auto">
          A private, calming space to record what you&apos;re grateful for. Your entries stay on your device.
        </p>
      </section>

      <section className="py-12 px-[5%]">
        <div className="max-w-2xl mx-auto">
          {/* Today's prompt */}
          <div className="bg-amber-pale border-l-4 border-amber rounded-r-card p-6 mb-8">
            <p className="text-[0.78rem] font-bold tracking-widest uppercase text-amber mb-1">Today&apos;s Prompt</p>
            <p className="font-display italic text-[1.15rem] text-teal-deep">{prompt}</p>
          </div>

          {/* Mood */}
          <div className="mb-5">
            <p className="text-[0.85rem] font-semibold text-teal-deep mb-3 tracking-wide">How are you feeling right now?</p>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map(m => (
                <button key={m} onClick={() => setMood(mood === m ? '' : m)}
                  className={`px-4 py-1.5 rounded-full border text-[0.85rem] transition-all
                    ${mood === m ? 'bg-teal-deep text-white border-teal-deep' : 'bg-white text-text-mid border-teal-light hover:border-teal-mid'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Text area */}
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder="Write freely — there are no wrong answers here..."
            rows={6}
            className="w-full border border-teal-light rounded-[24px] px-6 py-4 text-[0.97rem] text-charcoal bg-white outline-none focus:border-teal-mid transition-colors resize-none placeholder:text-text-xlight mb-4"
          />

          <div className="flex items-center gap-4">
            <button onClick={save}
              className="bg-teal-deep text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-dark transition-colors">
              Save Entry ✓
            </button>
            {saved && <span className="text-teal-mid font-medium text-[0.9rem]">🌱 Saved!</span>}
          </div>

          {/* Past entries */}
          {entries.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-[1.4rem] text-charcoal mb-5">Past entries</h2>
              <div className="space-y-4">
                {entries.map(e => (
                  <div key={e.id} className="bg-white rounded-card border border-teal-light p-6 shadow-card">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[0.8rem] font-semibold text-teal-mid">{e.date}</span>
                      {e.mood && <span className="text-[0.8rem] bg-teal-ghost text-teal-deep px-3 py-0.5 rounded-full">{e.mood}</span>}
                    </div>
                    <p className="text-[0.82rem] italic text-text-xlight mb-2">{e.prompt}</p>
                    <p className="text-[0.95rem] text-text-mid leading-[1.75] whitespace-pre-wrap">{e.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
