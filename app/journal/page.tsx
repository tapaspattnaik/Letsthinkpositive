'use client'

import { useState, useEffect } from 'react'
import { VoiceDictation } from '@/components/ui/VoiceDictation'
import { DistressSupport } from '@/components/DistressSupport'

interface Entry {
  id:      string
  date:    string
  prompt:  string
  text:    string
  mood:    string
}

const MOODS = ['🌟 Grateful', '😌 Calm', '🌱 Hopeful', '💪 Strong', '😔 Struggling', '🌈 Joyful']

const STATIC_PROMPTS = [
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

const MOOD_META: Record<string, { color: string; label: string }> = {
  '🌟 Grateful':  { color: 'bg-amber',       label: 'Grateful'  },
  '😌 Calm':      { color: 'bg-teal-mid',     label: 'Calm'      },
  '🌱 Hopeful':   { color: 'bg-green-400',    label: 'Hopeful'   },
  '💪 Strong':    { color: 'bg-blue-400',     label: 'Strong'    },
  '😔 Struggling':{ color: 'bg-indigo-300',   label: 'Struggling'},
  '🌈 Joyful':    { color: 'bg-pink-300',     label: 'Joyful'    },
}

function EmotionTrends({ entries }: { entries: Entry[] }) {
  const [insight, setInsight] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/ai-emotion-pattern')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.insight) setInsight(d.insight) })
      .catch(() => {})
  }, [])

  // Count moods from journal entries (last 30 or all)
  const counts: Record<string, number> = {}
  entries.forEach(e => {
    if (e.mood) counts[e.mood] = (counts[e.mood] ?? 0) + 1
  })

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const total = entries.filter(e => e.mood).length
  if (total === 0) return null

  const topMood = sorted[0]?.[0]
  const topMeta = MOOD_META[topMood]

  return (
    <div className="mt-10 bg-gradient-to-br from-teal-ghost to-white border border-teal-light rounded-[20px] p-6">
      <p className="text-[0.72rem] font-bold text-teal-mid uppercase tracking-widest mb-4">
        🔍 Your Emotional Patterns
      </p>

      {/* Mood frequency bars */}
      <div className="space-y-2.5 mb-5">
        {sorted.map(([moodKey, count]) => {
          const meta = MOOD_META[moodKey]
          const pct  = Math.round((count / total) * 100)
          return (
            <div key={moodKey} className="flex items-center gap-3">
              <span className="text-[0.75rem] w-24 text-text-mid flex-shrink-0">{moodKey}</span>
              <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${meta?.color ?? 'bg-teal-mid'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[0.7rem] text-text-xlight w-8 text-right">{count}×</span>
            </div>
          )
        })}
      </div>

      {/* Top mood callout */}
      {topMeta && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">{topMood.split(' ')[0]}</span>
          <p className="text-[0.8rem] font-semibold text-charcoal">
            Most frequent: <span className="text-teal-deep">{topMeta.label}</span>
            <span className="text-text-xlight font-normal"> · {Math.round((sorted[0][1] / total) * 100)}% of entries</span>
          </p>
        </div>
      )}

      {/* AI insight */}
      {insight && (
        <p className="text-[0.78rem] italic text-text-mid leading-relaxed border-t border-teal-light/60 pt-3">
          ✨ {insight}
        </p>
      )}
    </div>
  )
}

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [text, setText]       = useState('')
  const [mood, setMood]       = useState('')
  const [saved, setSaved]     = useState(false)
  const [tidying, setTidying] = useState(false)
  const [aiPrompt, setAiPrompt]   = useState<string | null>(null)
  const [promptSource, setPromptSource] = useState<'ai' | 'static'>('static')

  // Voice → tidy transcript → fill entry (and suggest mood if none picked)
  async function handleTranscript(raw: string) {
    setTidying(true)
    try {
      const res = await fetch('/api/ai-tidy-transcript', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: raw }),
      })
      const d = res.ok ? await res.json() : { text: raw, mood: null }
      setText(t => t ? `${t}\n${d.text ?? raw}` : (d.text ?? raw))
      if (d.mood) setMood(m => m || d.mood)
    } catch {
      setText(t => t ? `${t}\n${raw}` : raw)
    } finally {
      setTidying(false)
    }
  }

  const staticPrompt = STATIC_PROMPTS[new Date().getDay() % STATIC_PROMPTS.length]
  const prompt = aiPrompt ?? staticPrompt

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ltp_journal')
      if (stored) setEntries(JSON.parse(stored))
    } catch { /* noop */ }
  }, [])

  // Fetch mood-aware AI prompt
  useEffect(() => {
    fetch('/api/ai-journal-prompt')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.prompt) {
          setAiPrompt(data.prompt)
          setPromptSource(data.source === 'static' ? 'static' : 'ai')
        }
      })
      .catch(() => {})
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
    // Touch streak (fire-and-forget)
    fetch('/api/streak', { method: 'POST' }).catch(() => {})
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
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[0.78rem] font-bold tracking-widest uppercase text-amber">Today&apos;s Prompt</p>
              {promptSource === 'ai' && (
                <span className="text-[0.65rem] font-semibold bg-teal-deep/10 text-teal-deep px-2 py-0.5 rounded-full tracking-wide">
                  ✨ personalised
                </span>
              )}
            </div>
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

          {/* Voice dictation — speak instead of type */}
          <div className="flex items-center gap-3 mb-3">
            <VoiceDictation disabled={tidying} onTranscript={handleTranscript} />
            {tidying && <span className="text-[0.78rem] text-teal-mid font-medium">✨ Tidying up your words…</span>}
          </div>

          {/* Text area */}
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder="Write freely — or tap the mic and just talk. There are no wrong answers here..."
            rows={6}
            className="w-full border border-teal-light rounded-[24px] px-6 py-4 text-[0.97rem] text-charcoal bg-white outline-none focus:border-teal-mid transition-colors resize-none placeholder:text-text-xlight mb-4"
          />

          {/* Distress-aware support — shown instantly if crisis signals detected */}
          <DistressSupport text={text} />

          <div className="flex items-center gap-4">
            <button onClick={save}
              className="bg-teal-deep text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-dark transition-colors">
              Save Entry ✓
            </button>
            {saved && <span className="text-teal-mid font-medium text-[0.9rem]">🌱 Saved!</span>}
          </div>

          {/* Emotion Trends */}
          {entries.length >= 3 && <EmotionTrends entries={entries} />}

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
