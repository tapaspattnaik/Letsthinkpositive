'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface TagEntry { tag: string; count: number }
interface TrendingData {
  global:   TagEntry[]
  regional: TagEntry[]
  region:   string
}

export function TrendingHashtags() {
  const [data,    setData]    = useState<TrendingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<'global' | 'regional'>('regional')

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    fetch(`/api/hashtag/trending?timezone=${encodeURIComponent(timezone)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Font sizes scale with rank (biggest first)
  function tagSize(idx: number) {
    if (idx === 0) return 'text-[0.95rem] font-bold'
    if (idx <= 2)  return 'text-[0.85rem] font-semibold'
    if (idx <= 5)  return 'text-[0.78rem] font-medium'
    return 'text-[0.72rem]'
  }

  const tags     = data ? (tab === 'regional' && data.regional.length > 0 ? data.regional : data.global) : []
  const showTabs = data && data.regional.length > 0

  return (
    <div className="bg-white rounded-[24px] p-5 shadow-card border border-teal-light/60">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-display font-bold text-charcoal text-[0.95rem]">🔥 Trending</h3>
          {data && (
            <p className="text-text-xlight text-[0.65rem] mt-0.5">Last 7 days · community posts</p>
          )}
        </div>
        <Link href="/community" className="text-teal-mid text-[0.7rem] font-semibold no-underline hover:text-teal-deep">
          All posts →
        </Link>
      </div>

      {/* Region tabs */}
      {showTabs && (
        <div className="flex gap-1 bg-teal-ghost/60 rounded-full p-1 mb-4">
          {(['regional', 'global'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 px-3 py-1.5 rounded-full text-[0.72rem] font-semibold transition-all capitalize
                ${tab === t ? 'bg-white text-teal-deep shadow-sm' : 'text-text-xlight hover:text-charcoal'}`}>
              {t === 'regional' ? `📍 ${data?.region}` : '🌍 Global'}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex gap-1.5 justify-center py-4">
          {[0,1,2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay:`${i*150}ms` }} />
          ))}
        </div>
      )}

      {!loading && tags.length === 0 && (
        <div className="text-center py-4">
          <p className="text-text-xlight text-[0.78rem]">No trending tags yet — be the first to post with a #hashtag!</p>
        </div>
      )}

      {!loading && tags.length > 0 && (
        <div className="space-y-0.5">
          {tags.map((entry, idx) => (
            <Link key={entry.tag} href={`/hashtag/${entry.tag}`}
              className="flex items-center justify-between px-2 py-2 rounded-[10px] hover:bg-teal-ghost group no-underline transition-colors">
              <div className="flex items-center gap-2.5">
                <span className="text-text-xlight text-[0.65rem] w-4 text-right font-mono">{idx + 1}</span>
                <span className={`text-teal-deep group-hover:text-teal-dark transition-colors ${tagSize(idx)}`}>
                  #{entry.tag}
                </span>
              </div>
              <span className="text-text-xlight text-[0.65rem] font-medium">
                {entry.count} {entry.count === 1 ? 'post' : 'posts'}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Post with hashtag CTA */}
      {!loading && (
        <div className="mt-4 pt-3 border-t border-teal-light/40">
          <p className="text-text-xlight text-[0.7rem] text-center">
            Use <span className="text-teal-deep font-semibold">#hashtags</span> in your posts to get discovered
          </p>
        </div>
      )}
    </div>
  )
}
