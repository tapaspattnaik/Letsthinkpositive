'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// ── "On this day" memory card ───────────────────────────────────────────────
// Resurfaces what the user wrote on this same date in the past — gratitude
// entries + intentions from the server, journal entries from localStorage.

interface Memory {
  type: 'gratitude' | 'intention' | 'journal'
  text: string
  date: string
  ago:  string
}

interface JournalEntry { id: string; date: string; text: string; mood: string }

const TYPE_META: Record<Memory['type'], { icon: string; label: string }> = {
  gratitude: { icon: '🙏', label: 'You were grateful for' },
  intention: { icon: '🌅', label: 'Your intention was'    },
  journal:   { icon: '📓', label: 'You wrote'             },
}

function agoLabel(dateStr: string, todayStr: string): string {
  const [y, m]   = dateStr.split('-').map(Number)
  const [ty, tm] = todayStr.split('-').map(Number)
  const months = (ty - y) * 12 + (tm - m)
  if (months >= 12) {
    const years = Math.floor(months / 12)
    return years === 1 ? '1 year ago' : `${years} years ago`
  }
  return months === 1 ? '1 month ago' : `${months} months ago`
}

export function OnThisDayCard() {
  const { status } = useSession()
  const [memories, setMemories] = useState<Memory[]>([])

  useEffect(() => {
    if (status !== 'authenticated') return

    const today    = new Date().toISOString().split('T')[0]
    const monthDay = today.slice(4)   // -MM-DD

    // Local journal memories (entries live on-device)
    let local: Memory[] = []
    try {
      const stored: JournalEntry[] = JSON.parse(localStorage.getItem('ltp_journal') ?? '[]')
      local = stored
        .filter(e => e.date !== today && e.date.endsWith(monthDay) && e.text)
        .slice(0, 2)
        .map(e => ({ type: 'journal' as const, text: e.text, date: e.date, ago: agoLabel(e.date, today) }))
    } catch { /* noop */ }

    // Server memories (gratitude + intentions)
    fetch('/api/on-this-day')
      .then(r => r.ok ? r.json() : { memories: [] })
      .then(({ memories: server }) => {
        const merged = [...local, ...(server ?? [])]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 3)
        setMemories(merged)
      })
      .catch(() => { if (local.length) setMemories(local.slice(0, 3)) })
  }, [status])

  if (status !== 'authenticated' || memories.length === 0) return null

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber/10 to-ivory border border-amber/25 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[1.2rem]">🕰️</span>
        <p className="text-[0.72rem] font-bold text-amber uppercase tracking-widest">On this day</p>
      </div>

      <div className="space-y-3">
        {memories.map((m, i) => {
          const meta = TYPE_META[m.type]
          return (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-[1rem] mt-0.5 flex-shrink-0">{meta.icon}</span>
              <div className="min-w-0">
                <p className="text-[0.68rem] text-text-xlight font-semibold mb-0.5">
                  {meta.label} · {m.ago}
                </p>
                <p className="text-charcoal text-[0.85rem] leading-relaxed italic">
                  &ldquo;{m.text.length > 160 ? m.text.slice(0, 160) + '…' : m.text}&rdquo;
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <Link href="/journal"
        className="mt-4 inline-block text-[0.75rem] font-semibold text-amber hover:text-amber-soft no-underline transition-colors">
        Add today&apos;s memory →
      </Link>
    </div>
  )
}
