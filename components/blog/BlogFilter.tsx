'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PostMeta {
  slug: string
  title: string
  date: string
  tag: string
  author: string
  excerpt: string
}

const FILTERS = ['All', 'Mindset', 'Wellness', 'Career', 'Student Life', 'Habits']

export function BlogFilter({ posts }: { posts: PostMeta[] }) {
  const [activeFilter, setActiveFilter] = useState('All')

  const visible = activeFilter === 'All'
    ? posts
    : posts.filter(p => p.tag === activeFilter)

  return (
    <>
      {/* Filter buttons */}
      <div role="group" aria-label="Filter posts by category" className="flex gap-3 flex-wrap mb-8">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            aria-pressed={activeFilter === f}
            className={`px-5 py-2 rounded-full border text-[0.85rem] font-medium transition-all duration-200 min-h-[44px]
              ${activeFilter === f
                ? 'bg-teal-deep text-white border-teal-deep shadow-sm'
                : 'bg-white text-text-mid border-teal-light hover:border-teal-mid hover:text-teal-deep'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-live="polite" aria-atomic="false">
        {visible.length > 0 ? visible.map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`}
            className="bg-white rounded-[24px] overflow-hidden shadow-card border border-teal-light/30 hover:-translate-y-1.5 hover:shadow-lift transition-all duration-300 no-underline group">
            <div className="h-2 bg-gradient-to-r from-teal-mid to-amber" />
            <div className="p-7">
              <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-teal-mid mb-3 block">{post.tag}</span>
              <h2 className="font-display text-[1.12rem] text-charcoal leading-snug mb-3 group-hover:text-teal-deep transition-colors">{post.title}</h2>
              <p className="text-[0.87rem] text-text-light leading-[1.7]">{post.excerpt}</p>
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
            <p className="text-[2rem] mb-3">🌿</p>
            <p className="text-text-mid font-semibold text-[1rem] mb-1">No posts in this category yet</p>
            <p className="text-text-light text-[0.88rem]">
              Be the first to write something for <span className="text-teal-deep font-semibold">{activeFilter}</span>!
            </p>
            <button
              onClick={() => setActiveFilter('All')}
              className="mt-5 text-[0.88rem] text-teal-mid font-semibold hover:text-teal-deep transition-colors underline underline-offset-2">
              ← Show all posts
            </button>
          </div>
        )}

        {/* Community placeholder — shown on All or when there are results */}
        {(activeFilter === 'All' || visible.length > 0) && (
          <div className="bg-teal-ghost rounded-[24px] overflow-hidden border-2 border-dashed border-teal-light">
            <div className="h-2 bg-teal-light" />
            <div className="p-7 text-center">
              <span className="text-[2rem]">✍️</span>
              <h3 className="font-body font-semibold text-[1rem] text-teal-deep mt-3 mb-2">Your story could live right here</h3>
              <p className="text-[0.86rem] text-text-light leading-[1.7]">
                We welcome community posts. If it&apos;s genuine and comes from the heart, it has a home on this blog.
              </p>
            </div>
            <div className="px-7 py-4 border-t border-teal-light/50 flex justify-center">
              <Link href="/blog/submit" className="text-[0.82rem] font-semibold text-teal-mid no-underline hover:text-teal-deep transition-colors">
                Submit your post →
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
