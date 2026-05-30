'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface SleepLog {
  id: number; date: string; bedtime: string; wakeTime: string
  durationMins: number; quality: number; notes: string | null; createdAt: string
}

const QUALITY = [
  { n: 1, emoji: '😩', label: 'Terrible',  color: 'bg-red-100 border-red-300 text-red-600'       },
  { n: 2, emoji: '😕', label: 'Poor',       color: 'bg-orange-100 border-orange-300 text-orange-600' },
  { n: 3, emoji: '😐', label: 'Okay',       color: 'bg-amber/20 border-amber/40 text-amber'         },
  { n: 4, emoji: '😊', label: 'Good',       color: 'bg-teal-ghost border-teal-light text-teal-deep'  },
  { n: 5, emoji: '😴', label: 'Excellent',  color: 'bg-teal-ghost border-teal-mid text-teal-deep'    },
]

const SLEEP_TIPS = [
  { q: [1,2], tip: 'Try 4-7-8 breathing before bed — it slows your heart rate and prepares your body for sleep.', href: '/breathing' },
  { q: [1,2], tip: 'Avoid screens 1 hour before bedtime. Blue light suppresses melatonin production.', href: null },
  { q: [3],   tip: 'Keep your wake time consistent — even on weekends. A fixed schedule anchors your body clock.', href: null },
  { q: [3],   tip: 'A warm bath or shower 1–2 hours before bed triggers a natural cooling effect that induces sleep.', href: null },
  { q: [4,5], tip: 'Great sleep! Keep it up — your bedtime routine is working. Note what you did differently today.', href: null },
]

function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12  = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function getToday() { return new Date().toISOString().slice(0, 10) }

export default function SleepTrackerPage() {
  const { data: session, status } = useSession()
  const [logs,     setLogs]     = useState<SleepLog[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  // Form
  const [date,     setDate]     = useState(getToday())
  const [bedtime,  setBedtime]  = useState('22:30')
  const [wakeTime, setWakeTime] = useState('06:30')
  const [quality,  setQuality]  = useState(0)
  const [notes,    setNotes]    = useState('')
  const [formErr,  setFormErr]  = useState('')

  const fetchLogs = useCallback(async () => {
    if (!session) return
    const res = await fetch('/api/sleep')
    if (res.ok) setLogs(await res.json())
    setLoading(false)
  }, [session])

  useEffect(() => { if (status === 'authenticated') fetchLogs() }, [status, fetchLogs])

  async function submitLog(e: React.FormEvent) {
    e.preventDefault()
    if (!quality) { setFormErr('Please rate your sleep quality.'); return }
    setSaving(true); setFormErr('')
    const res  = await fetch('/api/sleep', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, bedtime, wakeTime, quality, notes }),
    })
    const data = await res.json()
    if (!res.ok) { setFormErr(data.error || 'Something went wrong.'); setSaving(false); return }
    await fetchLogs()
    setSaving(false); setSaved(true); setShowForm(false)
    setTimeout(() => setSaved(false), 3000)
    setNotes(''); setQuality(0); setDate(getToday())
  }

  async function deleteLog(id: number) {
    setDeleting(id)
    await fetch('/api/sleep', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setLogs(prev => prev.filter(l => l.id !== id))
    setDeleting(null)
  }

  // Stats
  const last7   = logs.slice(0, 7)
  const avgDur  = last7.length ? Math.round(last7.reduce((a, l) => a + l.durationMins, 0) / last7.length) : 0
  const avgQual = last7.length ? (last7.reduce((a, l) => a + l.quality, 0) / last7.length).toFixed(1) : '—'
  const best    = last7.reduce((b, l) => l.durationMins > (b?.durationMins ?? 0) ? l : b, null as SleepLog | null)
  const tonight = logs.find(l => l.date === getToday())

  // Live duration preview
  function previewDuration() {
    if (!bedtime || !wakeTime) return ''
    const [bh, bm] = bedtime.split(':').map(Number)
    const [wh, wm] = wakeTime.split(':').map(Number)
    let d = (wh * 60 + wm) - (bh * 60 + bm)
    if (d <= 0) d += 1440
    return fmtDuration(d)
  }

  // Tip based on last quality
  const lastQuality = logs[0]?.quality ?? 3
  const tip = SLEEP_TIPS.find(t => t.q.includes(lastQuality))

  // Chart data — last 7 days
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const log = logs.find(l => l.date === dateStr)
    return { dateStr, label: d.toLocaleDateString('en-GB', { weekday: 'short' }), mins: log?.durationMins ?? 0, quality: log?.quality ?? 0 }
  })
  const maxMins = Math.max(...chartData.map(d => d.mins), 540)

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#071a2a] to-[#040e1a] flex items-center justify-center px-4 pt-[72px]">
        <div className="text-center">
          <span className="text-[4rem] block mb-4">🌙</span>
          <h1 className="font-display text-[2rem] text-white font-bold mb-3">Sleep Tracker</h1>
          <p className="text-white/60 mb-6">Sign in to track your sleep and unlock insights.</p>
          <Link href="/login" className="bg-teal-mid text-white px-7 py-3 rounded-full font-semibold no-underline hover:bg-teal-deep transition-colors">Sign in →</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071a2a] via-[#0a2030] to-[#040e1a] pt-[72px]">

      {/* Hero */}
      <div className="px-[5%] pt-12 pb-8 max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-teal-mid text-[0.75rem] font-semibold tracking-[0.2em] uppercase mb-2">Sleep Tracker</p>
            <h1 className="font-display text-[2.2rem] sm:text-[2.8rem] font-bold text-white leading-tight mb-2">
              Rest well. <em className="text-amber-soft italic">Live well.</em>
            </h1>
            <p className="text-white/55 text-[0.95rem] max-w-[480px]">
              Sleep is the foundation of mental wellness. Track yours, spot patterns, and wake up better.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex-shrink-0 flex items-center gap-2 bg-teal-mid text-white px-5 py-3 rounded-full font-semibold text-[0.88rem] hover:bg-teal-deep transition-all hover:scale-105 shadow-lg">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Log Sleep
          </button>
        </div>

        {saved && (
          <div className="mt-4 inline-flex items-center gap-2 bg-teal-mid/20 border border-teal-mid/40 text-teal-mid rounded-full px-4 py-2 text-[0.82rem] font-semibold">
            ✓ Sleep logged successfully
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-[5%] pb-14 space-y-6">

        {/* Stats row */}
        {logs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Avg Duration',   value: avgDur ? fmtDuration(avgDur) : '—', icon: '⏱️',  sub: 'last 7 nights' },
              { label: 'Sleep Quality',  value: `${avgQual} / 5`,                   icon: '⭐',  sub: 'last 7 nights' },
              { label: 'Nights Logged',  value: String(logs.length),                icon: '📅',  sub: 'total' },
              { label: 'Best Night',     value: best ? fmtDuration(best.durationMins) : '—', icon: '🏆', sub: best?.date ?? '' },
            ].map(s => (
              <div key={s.label} className="bg-white/8 border border-white/12 rounded-[18px] p-4 text-center">
                <span className="text-[1.4rem] block mb-1">{s.icon}</span>
                <p className="text-white font-bold text-[1.3rem] leading-none">{s.value}</p>
                <p className="text-white/45 text-[0.68rem] mt-1">{s.label}</p>
                {s.sub && <p className="text-white/30 text-[0.62rem]">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}

        {/* 7-day chart */}
        {logs.length > 0 && (
          <div className="bg-white/8 border border-white/12 rounded-[24px] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-display font-bold text-[1.1rem]">7-Day Sleep Chart</h2>
                <p className="text-white/45 text-[0.75rem]">Hours of sleep per night</p>
              </div>
              <div className="flex items-center gap-3 text-[0.68rem] text-white/40">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-mid inline-block" />Good (7–9h)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber inline-block" />Short (&lt;7h)</span>
              </div>
            </div>
            <div className="flex items-end gap-3 h-40">
              {chartData.map(d => {
                const pct = d.mins > 0 ? (d.mins / maxMins) * 100 : 0
                const hrs = d.mins / 60
                const col = d.mins === 0 ? 'bg-white/10' : hrs >= 7 ? 'bg-teal-mid' : hrs >= 5 ? 'bg-amber' : 'bg-red-400'
                const qEmoji = QUALITY.find(q => q.n === d.quality)?.emoji ?? ''
                return (
                  <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1.5">
                    {d.mins > 0 && <span className="text-[0.75rem]">{qEmoji}</span>}
                    <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                      <div
                        className={`w-full rounded-t-[8px] transition-all duration-700 ${col} relative group cursor-default`}
                        style={{ height: `${pct}%`, minHeight: d.mins > 0 ? '4px' : '0' }}>
                        {d.mins > 0 && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[0.65rem] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {fmtDuration(d.mins)}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-white/45 text-[0.65rem] font-medium">{d.label}</span>
                    {d.mins > 0 && <span className="text-white/30 text-[0.6rem]">{(d.mins/60).toFixed(1)}h</span>}
                  </div>
                )
              })}
            </div>
            {/* 8h line */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
              <div className="w-6 h-px bg-teal-mid" />
              <span className="text-white/35 text-[0.68rem]">Recommended: 7–9 hours for adults</span>
            </div>
          </div>
        )}

        {/* Personalised tip */}
        {tip && logs.length > 0 && (
          <div className="bg-amber/10 border border-amber/30 rounded-[20px] p-5 flex items-start gap-4">
            <span className="text-[1.8rem] flex-shrink-0">💡</span>
            <div>
              <p className="text-amber font-semibold text-[0.88rem] mb-1">Sleep Tip for You</p>
              <p className="text-white/70 text-[0.85rem] leading-[1.7]">{tip.tip}</p>
              {tip.href && (
                <Link href={tip.href} className="inline-block mt-2 text-teal-mid text-[0.8rem] font-semibold hover:text-teal-light no-underline transition-colors">
                  Try it now →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Log history */}
        <div className="bg-white/8 border border-white/12 rounded-[24px] p-6">
          <h2 className="text-white font-display font-bold text-[1.1rem] mb-5">Sleep History</h2>

          {loading ? (
            <div className="flex justify-center py-10"><div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}</div></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-[4rem] block mb-3">🌙</span>
              <p className="text-white/60 text-[0.92rem] mb-4">No sleep logged yet. Start tracking tonight!</p>
              <button onClick={() => setShowForm(true)} className="bg-teal-mid text-white px-6 py-2.5 rounded-full font-semibold text-[0.88rem] hover:bg-teal-deep transition-colors">Log Tonight&apos;s Sleep →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map(log => {
                const q = QUALITY.find(q => q.n === log.quality)!
                const hrs = (log.durationMins / 60).toFixed(1)
                return (
                  <div key={log.id} className="flex items-center gap-4 bg-white/5 hover:bg-white/8 rounded-[16px] px-5 py-4 transition-all group">
                    {/* Quality emoji */}
                    <span className="text-[1.8rem] flex-shrink-0">{q.emoji}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-white font-semibold text-[0.9rem]">
                          {new Date(log.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' })}
                        </p>
                        <span className={`text-[0.68rem] font-bold px-2.5 py-0.5 rounded-full border ${q.color}`}>{q.label}</span>
                        {log.date === getToday() && (
                          <span className="text-[0.65rem] font-bold text-teal-mid bg-teal-mid/15 px-2 py-0.5 rounded-full">Tonight</span>
                        )}
                      </div>
                      <p className="text-white/45 text-[0.78rem] mt-0.5">
                        {fmtTime(log.bedtime)} → {fmtTime(log.wakeTime)} · <strong className="text-white/60">{hrs}h</strong>
                      </p>
                      {log.notes && <p className="text-white/35 text-[0.75rem] mt-1 truncate italic">&ldquo;{log.notes}&rdquo;</p>}
                    </div>

                    {/* Duration bar */}
                    <div className="hidden sm:flex flex-col items-end gap-1 w-24 flex-shrink-0">
                      <span className="text-white font-bold text-[0.88rem]">{fmtDuration(log.durationMins)}</span>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${log.durationMins >= 420 ? 'bg-teal-mid' : log.durationMins >= 300 ? 'bg-amber' : 'bg-red-400'}`}
                          style={{ width: `${Math.min((log.durationMins / 540) * 100, 100)}%` }} />
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => deleteLog(log.id)}
                      disabled={deleting === log.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500/20 text-white/40 hover:text-red-400 flex-shrink-0">
                      {deleting === log.id
                        ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      }
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sleep hygiene tips */}
        <div className="bg-white/8 border border-white/12 rounded-[24px] p-6">
          <h2 className="text-white font-display font-bold text-[1.1rem] mb-4">Sleep Hygiene Checklist</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { tip: 'Same bedtime every night (±30 min)', icon: '⏰' },
              { tip: 'No screens 60 min before sleep',     icon: '📵' },
              { tip: 'Keep bedroom cool (16–19°C)',        icon: '❄️' },
              { tip: 'No caffeine after 2pm',              icon: '☕' },
              { tip: 'Dark, quiet sleep environment',      icon: '🌑' },
              { tip: 'Short walk or stretching before bed',icon: '🚶' },
              { tip: 'Avoid alcohol — it disrupts REM',   icon: '🍷' },
              { tip: 'Write tomorrow\'s to-do tonight',   icon: '📝' },
            ].map(t => (
              <div key={t.tip} className="flex items-center gap-3 bg-white/5 rounded-[12px] px-4 py-3">
                <span className="text-[1.1rem] flex-shrink-0">{t.icon}</span>
                <span className="text-white/65 text-[0.83rem]">{t.tip}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3 flex-wrap">
            <Link href="/breathing" className="text-teal-mid text-[0.82rem] font-semibold hover:text-teal-light no-underline transition-colors">🌬️ Try breathing exercises →</Link>
            <Link href="/meditation" className="text-teal-mid text-[0.82rem] font-semibold hover:text-teal-light no-underline transition-colors">🧘 Guided sleep meditation →</Link>
          </div>
        </div>
      </div>

      {/* ── Log Sleep Modal ──────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-[#0d2030] border border-white/15 rounded-[28px] w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-7 pt-7 pb-4">
              <div>
                <h2 className="text-white font-display font-bold text-[1.25rem]">🌙 Log Your Sleep</h2>
                <p className="text-white/45 text-[0.78rem]">How did you sleep?</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">✕</button>
            </div>

            <form onSubmit={submitLog} className="px-7 pb-7 space-y-5">
              {/* Date */}
              <div>
                <label className="block text-white/60 text-[0.75rem] font-semibold mb-1.5">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} max={getToday()}
                  className="w-full bg-white/8 border border-white/15 rounded-[12px] px-4 py-2.5 text-white text-[0.93rem] outline-none focus:border-teal-mid transition-colors" />
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-[0.75rem] font-semibold mb-1.5">🌙 Bedtime</label>
                  <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)}
                    className="w-full bg-white/8 border border-white/15 rounded-[12px] px-4 py-2.5 text-white text-[0.93rem] outline-none focus:border-teal-mid transition-colors" />
                </div>
                <div>
                  <label className="block text-white/60 text-[0.75rem] font-semibold mb-1.5">☀️ Wake time</label>
                  <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)}
                    className="w-full bg-white/8 border border-white/15 rounded-[12px] px-4 py-2.5 text-white text-[0.93rem] outline-none focus:border-teal-mid transition-colors" />
                </div>
              </div>
              {bedtime && wakeTime && (
                <p className="text-teal-mid text-[0.78rem] text-center -mt-2 font-medium">
                  ⏱ Duration: <strong>{previewDuration()}</strong>
                </p>
              )}

              {/* Quality */}
              <div>
                <label className="block text-white/60 text-[0.75rem] font-semibold mb-2">How did you sleep?</label>
                <div className="flex gap-2 justify-between">
                  {QUALITY.map(q => (
                    <button key={q.n} type="button" onClick={() => setQuality(q.n)}
                      className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[14px] border transition-all
                        ${quality === q.n
                          ? 'bg-teal-mid/30 border-teal-mid scale-105 shadow-lg'
                          : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/8'}`}>
                      <span className="text-[1.5rem]">{q.emoji}</span>
                      <span className={`text-[0.6rem] font-semibold leading-tight text-center ${quality === q.n ? 'text-teal-mid' : 'text-white/40'}`}>{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-white/60 text-[0.75rem] font-semibold mb-1.5">Notes <span className="font-normal opacity-50">(optional)</span></label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} maxLength={500}
                  placeholder="Dreams, disturbances, how you feel this morning…"
                  className="w-full bg-white/8 border border-white/15 rounded-[12px] px-4 py-2.5 text-white text-[0.88rem] outline-none focus:border-teal-mid resize-none placeholder:text-white/25 transition-colors" />
              </div>

              {formErr && <p className="text-red-400 text-[0.82rem] text-center">{formErr}</p>}

              <button type="submit" disabled={saving}
                className="w-full bg-teal-mid text-white py-3.5 rounded-full font-bold text-[0.95rem] hover:bg-teal-deep disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : '💾 Save Sleep Log'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
