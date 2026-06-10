'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Rec {
  type:    'article' | 'post'
  slug:    string
  href:    string
  title:   string
  excerpt: string
  badge:   string
  emoji:   string
}

function RecCard({ rec }: { rec: Rec }) {
  return (
    <Link
      href={rec.href}
      className="group flex gap-3 rounded-2xl bg-white border border-teal-light/60 p-4 shadow-card hover:shadow-md hover:border-teal-mid/40 transition-all no-underline"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-ghost flex items-center justify-center text-xl">
        {rec.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[0.62rem] font-bold uppercase tracking-wider text-amber bg-amber/10 px-2 py-0.5 rounded-full">
            {rec.badge}
          </span>
        </div>
        <p className="text-[0.88rem] font-semibold text-charcoal leading-snug group-hover:text-teal-deep transition-colors line-clamp-2 mb-1">
          {rec.title}
        </p>
        <p className="text-[0.75rem] text-text-xlight line-clamp-2 leading-relaxed">
          {rec.excerpt}
        </p>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="flex gap-3 rounded-2xl bg-white border border-teal-light/60 p-4 animate-pulse">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-20 rounded bg-gray-100" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-3 w-4/5 rounded bg-gray-100" />
      </div>
    </div>
  )
}

export function ForYouSection() {
  const [recs, setRecs] = useState<Rec[]>([])
  const [personalised, setPersonalised] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/for-you')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.recs?.length) {
          setRecs(data.recs)
          setPersonalised(data.personalised)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (!loading && recs.length === 0) return null

  return (
    <section className="py-8 px-[5%]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[1.25rem] text-charcoal font-bold">
              {personalised ? 'For You' : 'Start Here'}
            </h2>
            {personalised && (
              <span className="text-[0.65rem] font-semibold bg-teal-ghost text-teal-deep px-2 py-0.5 rounded-full">
                ✨ personalised
              </span>
            )}
          </div>
          <Link href="/library" className="text-[0.8rem] font-semibold text-teal-mid hover:text-teal-deep no-underline transition-colors">
            Browse all →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : recs.map(rec => <RecCard key={rec.slug} rec={rec} />)
          }
        </div>
      </div>
    </section>
  )
}
