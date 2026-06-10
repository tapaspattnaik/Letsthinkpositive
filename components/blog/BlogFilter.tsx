'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface PostMeta {
  slug:    string
  title:   string
  date:    string
  tag:     string
  author:  string
  excerpt: string
}

const PAGE_SIZE = 9   // posts per "page" before Load more

export function BlogFilter({ posts }: { posts: PostMeta[] }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [query,        setQuery]        = useState('')
  const [shown,        setShown]        = useState(PAGE_SIZE)

  // ── Dynamic categories — only ones that have at least one post ──────────
  const categories = useMemo(() => {
    const tags = Array.from(new Set(posts.map(p => p.tag))).sort()
    return ['All', ...tags]
  }, [posts])

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter(p => {
      const matchCat    = activeFilter === 'All' || p.tag === activeFilter
      const matchSearch = !q ||
        p.title.toLowerCase().includes(q)   ||
        p.excerpt.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)  ||
        p.tag.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [posts, activeFilter, query])

  const visible = filtered.slice(0, shown)
  const hasMore = filtered.length > shown

  function changeFilter(cat: string) {
    setActiveFilter(cat)
    setShown(PAGE_SIZE)   // reset pagination on filter change
  }

  function changeQuery(val: string) {
    setQuery(val)
    setShown(PAGE_SIZE)   // reset pagination on search change
  }

  return (
    <>
      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-xlight text-[1rem] pointer-events-none">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={e => changeQuery(e.target.value)}
          placeholder="Search by title, topic, or author…"
          className="w-full pl-10 pr-4 py-3 rounded-[14px] border border-teal-light bg-white text-[0.9rem] text-charcoal placeholder:text-text-xlight outline-none focus:border-teal-mid transition-colors"
        />
        {query && (
          <button
            onClick={() => changeQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-xlight hover:text-charcoal text-[1.1rem] leading-none"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* ── Category filter pills ─────────────────────────────────────────── */}
      <div role="group" aria-label="Filter posts by category" className="flex gap-2 flex-wrap mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => changeFilter(cat)}
            aria-pressed={activeFilter === cat}
            className={`px-4 py-1.5 rounded-full border text-[0.82rem] font-medium transition-all duration-200
              ${activeFilter === cat
                ? 'bg-teal-deep text-white border-teal-deep shadow-sm'
                : 'bg-white text-text-mid border-teal-light hover:border-teal-mid hover:text-teal-deep'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Results summary ───────────────────────────────────────────────── */}
      {(query || activeFilter !== 'All') && (
        <p className="text-[0.8rem] text-text-xlight mb-4">
          {filtered.length === 0
            ? 'No posts match your search'
            : `Showing ${Math.min(shown, filtered.length)} of ${filtered.length} post${filtered.length !== 1 ? 's' : ''}`
          }
          {activeFilter !== 'All' && <> in <strong className="text-teal-deep">{activeFilter}</strong></>}
          {query && <> matching <strong className="text-teal-deep">&ldquo;{query}&rdquo;</strong></>}
          {' · '}
          <button
            onClick={() => { changeFilter('All'); changeQuery('') }}
            className="text-teal-mid hover:text-teal-deep underline underline-offset-2 font-medium"
          >
            Clear filters
          </button>
        </p>
      )}

      {/* ── Posts grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-live="polite" aria-atomic="false">
        {visible.length > 0 ? visible.map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`}
            className="bg-white rounded-[24px] overflow-hidden shadow-card border border-teal-light/30 hover:-translate-y-1.5 hover:shadow-lift transition-all duration-300 no-underline group">
            <div className="h-2 bg-gradient-to-r from-teal-mid to-amber" />
            <div className="p-7">
              <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-teal-mid mb-3 block">{post.tag}</span>
              <h2 className="font-display text-[1.12rem] text-charcoal leading-snug mb-3 group-hover:text-teal-deep transition-colors">{post.title}</h2>
              <p className="text-[0.87rem] text-text-light leading-[1.7] line-clamp-3">{post.excerpt}</p>
            </div>
            <div className="px-7 py-4 border-t border-teal-ghost flex justify-between items-center">
              <span className="text-[0.82rem] font-semibold text-teal-mid group-hover:text-teal-deep transition-colors">Read more →</span>
              <span className="text-[0.76rem] text-text-xlight">
                By {post.author} · {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </Link>
        )) : (
          <div className="col-span-full text-center py-16">
            <p className="text-[2.5rem] mb-3">🌿</p>
            <p className="text-text-mid font-semibold text-[1rem] mb-1">
              {query ? `No posts found for "${query}"` : `No posts in ${activeFilter} yet`}
            </p>
            <p className="text-text-light text-[0.88rem] mb-5">
              {query ? 'Try a different search term, or browse all posts.' : 'Be the first to write something for this category!'}
            </p>
            <button
              onClick={() => { changeFilter('All'); changeQuery('') }}
              className="text-[0.88rem] text-teal-mid font-semibold hover:text-teal-deep transition-colors underline underline-offset-2">
              ← Show all posts
            </button>
          </div>
        )}

        {/* Submit CTA — always last in the grid */}
        {(activeFilter === 'All' || visible.length > 0) && !hasMore && (
          <Link
            href="/blog/submit"
            className="bg-teal-ghost rounded-[24px] overflow-hidden border-2 border-dashed border-teal-light no-underline
              hover:border-teal-mid hover:bg-teal-light/30 hover:-translate-y-1 transition-all duration-300 block group"
          >
            <div className="h-2 bg-teal-light group-hover:bg-teal-mid transition-colors" />
            <div className="p-7 text-center">
              <span className="text-[2rem]">✍️</span>
              <h3 className="font-body font-semibold text-[1rem] text-teal-deep mt-3 mb-2">Your story could live right here</h3>
              <p className="text-[0.86rem] text-text-light leading-[1.7]">
                We welcome community posts. If it&apos;s genuine and comes from the heart, it has a home on this blog.
              </p>
            </div>
            <div className="px-7 py-4 border-t border-teal-light/50 flex justify-center">
              <span className="text-[0.82rem] font-semibold text-teal-mid group-hover:text-teal-deep transition-colors">
                Submit your post →
              </span>
            </div>
          </Link>
        )}
      </div>

      {/* ── Load more ────────────────────────────────────────────────────── */}
      {hasMore && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-[0.8rem] text-text-xlight">
            Showing {shown} of {filtered.length} posts
          </p>
          <button
            onClick={() => setShown(s => s + PAGE_SIZE)}
            className="px-8 py-3 rounded-full border border-teal-mid text-teal-deep font-semibold text-[0.9rem]
              hover:bg-teal-deep hover:text-white transition-colors"
          >
            Load more posts ↓
          </button>
        </div>
      )}

      {/* After all loaded — show submit CTA inline below grid */}
      {!hasMore && visible.length > 0 && !filtered.length && null}
    </>
  )
}
