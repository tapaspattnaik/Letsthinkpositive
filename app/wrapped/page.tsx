'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// ── Year in Positivity — your wellness year, wrapped 🎁 ─────────────────────

interface WrappedData {
  year: number
  name: string
  activeDays: number
  moodLogs: number
  moodAvg: number | null
  topMood: { label: string; emoji: string } | null
  gratitudes: number
  kindestLine: string | null
  longestStreak: number
  badges: { name: string; icon: string }[]
  topPractice: { label: string; icon: string; count: number } | null
  topWord: string | null
  totalSleepHours: number | null
  kindnessActs: number
  hasData: boolean
}

function StatCard({ emoji, value, label, sub }: { emoji: string; value: string; label: string; sub?: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-[20px] p-5 text-center">
      <span className="text-[2rem] block mb-2">{emoji}</span>
      <p className="font-display font-bold text-white text-[2.2rem] leading-none mb-1">{value}</p>
      <p className="text-white/70 text-[0.8rem] font-semibold">{label}</p>
      {sub && <p className="text-white/45 text-[0.7rem] mt-1">{sub}</p>}
    </div>
  )
}

export default function WrappedPage() {
  const { status } = useSession({ required: true })
  const [data, setData] = useState<WrappedData | null>(null)
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/wrapped')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status])

  function downloadCard() {
    if (!data) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 1080, H = 1350
    canvas.width = W; canvas.height = H

    // Background — brand teal gradient
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#0F4040')
    grad.addColorStop(0.55, '#1A6B6B')
    grad.addColorStop(1, '#2D9B8A')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Soft decorative circles
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.beginPath(); ctx.arc(W - 80, 120, 220, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(60, H - 160, 260, 0, Math.PI * 2); ctx.fill()

    ctx.textAlign = 'center'

    // Header
    ctx.fillStyle = '#F5C96A'
    ctx.font = 'bold 38px Georgia, serif'
    ctx.fillText(`✨ ${data.year} in Positivity ✨`, W / 2, 130)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 64px Georgia, serif'
    ctx.fillText(`${data.name}'s Year`, W / 2, 225)

    // Stat rows
    const stats: [string, string][] = []
    if (data.activeDays > 0)      stats.push([`${data.activeDays}`, 'days showing up for yourself'])
    if (data.gratitudes > 0)      stats.push([`${data.gratitudes}`, 'moments of gratitude'])
    if (data.longestStreak > 1)   stats.push([`${data.longestStreak}`, 'day longest streak 🔥'])
    if (data.badges.length > 0)   stats.push([`${data.badges.length}`, `badge${data.badges.length === 1 ? '' : 's'} earned 🏅`])
    if (data.totalSleepHours)     stats.push([`${data.totalSleepHours}h`, 'of tracked rest 🌙'])
    if (data.kindnessActs > 0)    stats.push([`${data.kindnessActs}`, 'acts of kindness shared 💛'])

    let y = 360
    for (const [big, small] of stats.slice(0, 5)) {
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 88px Georgia, serif'
      ctx.fillText(big, W / 2, y)
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.font = '34px Georgia, serif'
      ctx.fillText(small, W / 2, y + 52)
      y += 165
    }

    // Top mood
    if (data.topMood) {
      ctx.fillStyle = '#F5C96A'
      ctx.font = '36px Georgia, serif'
      ctx.fillText(`Most common mood: ${data.topMood.emoji} ${data.topMood.label}`, W / 2, y + 10)
      y += 70
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '30px Georgia, serif'
    ctx.fillText('letsthinkpositive.com', W / 2, H - 70)
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.font = 'italic 26px Georgia, serif'
    ctx.fillText('where every thought begins with hope', W / 2, H - 32)

    // Download
    const a = document.createElement('a')
    a.download = `my-${data.year}-in-positivity.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-dark to-teal-deep pt-[72px]">
        <div className="flex gap-1.5">
          {[0,1,2].map(i => <span key={i} className="w-3 h-3 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
        </div>
      </div>
    )
  }

  if (!data || !data.hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-dark to-teal-deep pt-[72px] px-[5%] flex items-center justify-center">
        <div className="text-center max-w-md">
          <span className="text-[3.5rem] block mb-4">🌱</span>
          <h1 className="font-display text-white text-[1.6rem] font-bold mb-3">Your story is just beginning</h1>
          <p className="text-white/70 text-[0.95rem] leading-relaxed mb-6">
            Once you start logging moods, gratitudes and challenges, this page will turn your year into something beautiful to look back on.
          </p>
          <Link href="/mood" className="inline-block bg-amber text-charcoal font-semibold px-6 py-3 rounded-full no-underline hover:bg-amber-soft transition-colors">
            Start today →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F4040] via-teal-deep to-teal-mid pt-[100px] pb-16 px-[5%]">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-amber font-bold text-[0.8rem] uppercase tracking-[0.25em] mb-3">✨ {data.year} in Positivity ✨</p>
          <h1 className="font-display text-white text-[clamp(2rem,5vw,3rem)] font-bold leading-tight">
            {data.name}, what a year you&apos;ve built.
          </h1>
          <p className="text-white/60 text-[0.95rem] mt-3">One small practice at a time.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {data.activeDays > 0 && (
            <StatCard emoji="🌿" value={`${data.activeDays}`} label="days showing up" sub="for yourself" />
          )}
          {data.gratitudes > 0 && (
            <StatCard emoji="🙏" value={`${data.gratitudes}`} label="gratitude moments" />
          )}
          {data.longestStreak > 1 && (
            <StatCard emoji="🔥" value={`${data.longestStreak}`} label="day longest streak" />
          )}
          {data.moodLogs > 0 && (
            <StatCard emoji="📊" value={`${data.moodLogs}`} label="mood check-ins" sub={data.moodAvg ? `averaging ${data.moodAvg}/5` : undefined} />
          )}
          {data.totalSleepHours !== null && (
            <StatCard emoji="🌙" value={`${data.totalSleepHours}h`} label="of tracked rest" />
          )}
          {data.kindnessActs > 0 && (
            <StatCard emoji="💛" value={`${data.kindnessActs}`} label="acts of kindness" />
          )}
        </div>

        {/* Top mood + word + practice */}
        <div className="space-y-4 mb-8">
          {data.topMood && (
            <div className="bg-white/10 border border-white/15 rounded-[20px] p-5 flex items-center gap-4">
              <span className="text-[2.2rem]">{data.topMood.emoji}</span>
              <div>
                <p className="text-white/60 text-[0.75rem] font-semibold uppercase tracking-wider">Your most common mood</p>
                <p className="text-white font-display font-bold text-[1.3rem]">{data.topMood.label}</p>
              </div>
            </div>
          )}
          {data.topWord && (
            <div className="bg-white/10 border border-white/15 rounded-[20px] p-5 flex items-center gap-4">
              <span className="text-[2.2rem]">🌅</span>
              <div>
                <p className="text-white/60 text-[0.75rem] font-semibold uppercase tracking-wider">The word you chose most</p>
                <p className="text-white font-display font-bold text-[1.3rem] capitalize">&ldquo;{data.topWord}&rdquo;</p>
              </div>
            </div>
          )}
          {data.topPractice && (
            <div className="bg-white/10 border border-white/15 rounded-[20px] p-5 flex items-center gap-4">
              <span className="text-[2.2rem]">{data.topPractice.icon}</span>
              <div>
                <p className="text-white/60 text-[0.75rem] font-semibold uppercase tracking-wider">Your signature practice</p>
                <p className="text-white font-display font-bold text-[1.3rem]">{data.topPractice.label} · {data.topPractice.count}×</p>
              </div>
            </div>
          )}
        </div>

        {/* Kindest line */}
        {data.kindestLine && (
          <div className="bg-gradient-to-br from-amber/20 to-white/5 border border-amber/30 rounded-[24px] p-7 mb-8 text-center">
            <p className="text-amber text-[0.75rem] font-bold uppercase tracking-widest mb-3">💌 In your own words</p>
            <blockquote className="font-display italic text-white text-[clamp(1.05rem,2.5vw,1.35rem)] leading-relaxed">
              &ldquo;{data.kindestLine.length > 220 ? data.kindestLine.slice(0, 220) + '…' : data.kindestLine}&rdquo;
            </blockquote>
          </div>
        )}

        {/* Badges */}
        {data.badges.length > 0 && (
          <div className="bg-white/10 border border-white/15 rounded-[20px] p-5 mb-10">
            <p className="text-white/60 text-[0.75rem] font-semibold uppercase tracking-wider mb-3">🏅 Badges earned this year</p>
            <div className="flex flex-wrap gap-2">
              {data.badges.map((b, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-[0.8rem] font-semibold px-3.5 py-2 rounded-full">
                  <span>{b.icon}</span>{b.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share actions */}
        <div className="text-center">
          <button onClick={downloadCard}
            className="inline-flex items-center gap-2 bg-amber text-charcoal font-bold text-[0.95rem] px-8 py-3.5 rounded-full hover:bg-amber-soft hover:-translate-y-0.5 transition-all shadow-lg">
            🎁 Download my shareable card
          </button>
          <p className="text-white/40 text-[0.75rem] mt-3">A beautiful image card of your year — perfect for sharing anywhere.</p>
        </div>

        {/* Hidden canvas for share-card rendering */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
