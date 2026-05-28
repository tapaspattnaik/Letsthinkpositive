'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Article {
  title: string; description: string; url: string
  image: string | null; source: string; publishedAt: string
}

const CATEGORIES = [
  { key: 'all',         label: 'All Good News', icon: '🌍' },
  { key: 'science',     label: 'Science',       icon: '🔬' },
  { key: 'kindness',    label: 'Kindness',      icon: '💛' },
  { key: 'health',      label: 'Health',        icon: '💚' },
  { key: 'environment', label: 'Environment',   icon: '🌿' },
  { key: 'innovation',  label: 'Innovation',    icon: '💡' },
  { key: 'people',      label: 'People',        icon: '🤝' },
]

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1)  return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function GoodNewsPage() {
  const [articles,    setArticles]    = useState<Article[]>([])
  const [category,    setCategory]    = useState('all')
  const [loading,     setLoading]     = useState(true)
  const [configured,  setConfigured]  = useState(true)
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchNews = useCallback(async (cat: string, pg: number, append = false) => {
    if (!append) setLoading(true)
    else setLoadingMore(true)
    try {
      const res  = await fetch(`/api/news?category=${cat}&page=${pg}`)
      const data = await res.json()
      setConfigured(data.configured !== false)
      if (append) setArticles(prev => [...prev, ...(data.articles ?? [])])
      else setArticles(data.articles ?? [])
      setHasMore((data.articles?.length ?? 0) === 12)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    setPage(1)
    setArticles([])   // clear stale articles immediately so old category never shows while loading
    fetchNews(category, 1)
  }, [category, fetchNews])

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchNews(category, next, true)
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
            <span className="w-6 h-0.5 bg-amber rounded" /> Good News
          </div>
          <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-snug mb-4">
            The world is doing <em className="italic text-amber-soft">good things.</em>
          </h1>
          <p className="text-white/72 text-[1.05rem] leading-[1.8] max-w-[520px]">
            We&apos;ve filtered out the noise. What&apos;s left? Breakthroughs, kindness, hope, and stories of people making a real difference — from every corner of the globe.
          </p>
        </div>
      </section>

      {/* Category filters */}
      <div className="sticky top-[72px] z-30 bg-ivory/96 backdrop-blur-md border-b border-teal-light py-3 px-[5%]">
        <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c.key}
              onClick={() => setCategory(c.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[0.83rem] font-semibold transition-all
                ${category === c.key
                  ? 'bg-teal-deep text-white'
                  : 'bg-white border border-teal-light text-text-mid hover:border-teal-mid hover:text-teal-deep'}`}>
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-10 px-[5%]">
        {/* NewsAPI not configured notice */}
        {!configured && (
          <div className="bg-amber-soft/20 border border-amber rounded-[16px] px-5 py-4 mb-8 flex items-start gap-3">
            <span className="text-[1.2rem]">📰</span>
            <div>
              <p className="font-semibold text-[0.9rem] text-charcoal">Live news not yet connected</p>
              <p className="text-[0.82rem] text-text-mid mt-0.5">
                Add your <code className="bg-teal-ghost px-1.5 py-0.5 rounded">NEWS_API_KEY</code> from{' '}
                <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer" className="text-teal-mid underline">newsapi.org</a>{' '}
                (free plan) to your server <code className="bg-teal-ghost px-1.5 py-0.5 rounded">.env</code> to show real articles.
                Showing sample stories below.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[20px] border border-teal-light overflow-hidden animate-pulse">
                <div className="h-44 bg-teal-ghost" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-teal-ghost rounded w-3/4" />
                  <div className="h-3 bg-teal-ghost rounded" />
                  <div className="h-3 bg-teal-ghost rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[2.5rem] mb-4">🌱</p>
            <p className="text-text-mid">No stories found right now — check back soon.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                  className="group bg-white rounded-[20px] border border-teal-light overflow-hidden hover:shadow-lift hover:-translate-y-1 transition-all duration-300 no-underline flex flex-col">
                  {/* Image */}
                  <div className="h-44 bg-teal-ghost overflow-hidden relative flex-shrink-0">
                    {a.image ? (
                      <Image src={a.image} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[3rem]">
                          {CATEGORIES.find(c => c.key === category)?.icon ?? '🌍'}
                        </span>
                      </div>
                    )}
                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-teal-deep text-[0.7rem] font-bold px-2.5 py-1 rounded-full">
                        {a.source}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="font-display font-bold text-[1rem] text-charcoal leading-snug mb-2 group-hover:text-teal-deep transition-colors line-clamp-3">
                      {a.title}
                    </h2>
                    {a.description && (
                      <p className="text-[0.82rem] text-text-light leading-[1.7] mb-3 flex-1 line-clamp-3">
                        {a.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-teal-ghost">
                      <span className="text-[0.73rem] text-text-xlight">{timeAgo(a.publishedAt)}</span>
                      <span className="text-[0.78rem] font-semibold text-teal-mid group-hover:text-teal-deep transition-colors">
                        Read →
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-10">
                <button onClick={loadMore} disabled={loadingMore}
                  className="bg-white border border-teal-mid text-teal-deep px-8 py-3 rounded-full font-semibold text-[0.9rem] hover:bg-teal-ghost transition-colors disabled:opacity-60">
                  {loadingMore ? 'Loading…' : 'Load more stories →'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Share section */}
        <div className="mt-16 bg-gradient-to-r from-teal-ghost to-white border border-teal-light rounded-[24px] p-8 text-center">
          <p className="text-[1.5rem] mb-2">💌</p>
          <h3 className="font-display text-[1.2rem] font-bold text-charcoal mb-2">Know a good news story?</h3>
          <p className="text-text-mid text-[0.9rem] mb-4 max-w-[400px] mx-auto">
            If you&apos;ve come across something uplifting that the world should hear, share it with us.
          </p>
          <Link href="/contact"
            className="inline-block bg-teal-deep text-white px-7 py-3 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-teal-dark transition-colors">
            Share a story →
          </Link>
        </div>
      </div>
    </>
  )
}
