'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Tool { slug: string; label: string; emoji: string; href: string }

// Master list of all tools — slug must match what's stored
const ALL_TOOLS: Tool[] = [
  { slug: 'journal',       label: 'Journal',       emoji: '📓', href: '/journal' },
  { slug: 'mood',          label: 'Mood',           emoji: '📊', href: '/mood' },
  { slug: 'sleep',         label: 'Sleep',          emoji: '🌙', href: '/sleep' },
  { slug: 'water',         label: 'Water',          emoji: '💧', href: '/water' },
  { slug: 'breathing',     label: 'Breathing',      emoji: '🌬️', href: '/breathing' },
  { slug: 'meditation',    label: 'Meditation',     emoji: '🧘', href: '/meditation' },
  { slug: 'coach',         label: 'Calm Coach',     emoji: '🌿', href: '/coach' },
  { slug: 'reframe',       label: 'Reframer',       emoji: '🧠', href: '/reframe' },
  { slug: 'affirmation',   label: 'Affirmation',    emoji: '💌', href: '/affirmation' },
  { slug: 'habits',        label: 'Habits',         emoji: '🎯', href: '/habits' },
  { slug: 'challenges',    label: 'Challenges',     emoji: '🏆', href: '/challenges' },
  { slug: 'calendar',      label: 'Calendar',       emoji: '📅', href: '/calendar' },
  { slug: 'intention',     label: 'Intention',      emoji: '🌅', href: '/intention' },
  { slug: 'vision-board',  label: 'Vision Board',   emoji: '⭐', href: '/vision-board' },
  { slug: 'sounds',        label: 'Calm Sounds',    emoji: '🎧', href: '/sounds' },
  { slug: 'gratitude-wall',label: 'Gratitude Wall', emoji: '🙏', href: '/gratitude-wall' },
  { slug: 'quotes',        label: 'Quote Creator',  emoji: '🎨', href: '/quotes' },
  { slug: 'snapshot',      label: 'Snapshot',       emoji: '📈', href: '/snapshot' },
]

export function FavouriteToolsBar() {
  const { status } = useSession()
  const [tools, setTools]     = useState<Tool[]>([])
  const [loaded, setLoaded]   = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/favourite-tools')
      .then(r => r.json())
      .then(({ tools: slugs }) => {
        if (!Array.isArray(slugs) || slugs.length === 0) return
        const pinned = slugs
          .map((s: string) => ALL_TOOLS.find(t => t.slug === s))
          .filter(Boolean) as Tool[]
        setTools(pinned)
        setLoaded(true)
      })
      .catch(() => {})
  }, [status])

  if (!loaded || tools.length === 0) return null

  return (
    <section className="px-[5%] py-5 bg-white border-b border-teal-light/60">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-0.5">
          <p className="text-[0.72rem] font-bold text-text-xlight uppercase tracking-widest whitespace-nowrap flex-shrink-0">
            ⚡ Quick Access
          </p>
          {tools.map(tool => (
            <Link key={tool.slug} href={tool.href}
              className="flex-shrink-0 flex items-center gap-2 bg-teal-ghost hover:bg-teal-light/40 border border-teal-light hover:border-teal-mid text-teal-deep px-3.5 py-2 rounded-full text-[0.8rem] font-medium transition-all hover:-translate-y-0.5">
              <span className="text-[1rem]">{tool.emoji}</span>
              <span>{tool.label}</span>
            </Link>
          ))}
          <Link href="/profile" className="flex-shrink-0 text-[0.72rem] text-text-xlight hover:text-teal-deep transition-colors whitespace-nowrap ml-1">
            Edit ✎
          </Link>
        </div>
      </div>
    </section>
  )
}

// Export tool list so profile page can use it
export { ALL_TOOLS }
