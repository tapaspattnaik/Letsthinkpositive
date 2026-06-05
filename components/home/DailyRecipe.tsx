'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface RecipeTool { slug: string; label: string; emoji: string; href: string; reason: string }

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DailyRecipe() {
  const { data: session, status } = useSession()
  const [tools,   setTools]   = useState<RecipeTool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== 'authenticated') { setLoading(false); return }
    fetch('/api/wellness-recipe')
      .then(r => r.json())
      .then(({ recipe }) => { if (recipe?.tools) setTools(recipe.tools) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status])

  if (status === 'unauthenticated' || (status === 'authenticated' && !loading && tools.length === 0)) return null
  if (loading && status === 'authenticated') return (
    <div className="animate-pulse bg-teal-ghost/40 rounded-3xl h-36 w-full" />
  )

  const name = session?.user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="bg-gradient-to-br from-teal-deep to-teal-dark rounded-3xl p-6 text-white shadow-lift">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-white/70 text-[0.78rem] font-medium uppercase tracking-widest mb-1">
            🌿 Your plan for today
          </p>
          <h3 className="font-display font-bold text-[1.2rem] leading-tight">
            {greeting()}, {name} ✨
          </h3>
          <p className="text-white/65 text-[0.8rem] mt-0.5">
            Based on your recent mood, sleep & streak
          </p>
        </div>
        <span className="text-[2rem] flex-shrink-0">☀️</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tools.map((tool, i) => (
          <Link key={tool.slug} href={tool.href}
            className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl p-3.5 transition-all hover:-translate-y-0.5 no-underline">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[1.2rem]">{tool.emoji}</span>
              <p className="font-semibold text-[0.86rem] text-white leading-none">{tool.label}</p>
              <span className="ml-auto text-white/40 group-hover:text-white/80 transition-colors text-[0.8rem]">→</span>
            </div>
            <p className="text-white/60 text-[0.72rem] leading-snug">{tool.reason}</p>
            <div className="mt-2 flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[0.65rem] font-bold text-white">
                {i + 1}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
