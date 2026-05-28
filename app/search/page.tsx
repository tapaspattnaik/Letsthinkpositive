'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

interface BlogResult      { title: string; excerpt: string; href: string; tag: string; date: string }
interface CommunityResult { title: string; excerpt: string; href: string; author: string }
interface LibraryResult   { title: string; excerpt: string; href: string; category: string }

interface Results {
  blog:      BlogResult[]
  community: CommunityResult[]
  library:   LibraryResult[]
}

function SearchInner() {
  const params    = useSearchParams()
  const router    = useRouter()
  const inputRef  = useRef<HTMLInputElement>(null)

  const initialQ  = params.get('q') ?? ''
  const [query,   setQuery]   = useState(initialQ)
  const [results, setResults] = useState<Results | null>(null)
  const [loading, setLoading] = useState(false)

  // Focus input on load
  useEffect(() => { inputRef.current?.focus() }, [])

  // Search when URL query param changes
  useEffect(() => {
    if (!initialQ) return
    setQuery(initialQ)
    doSearch(initialQ)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ])

  async function doSearch(q: string) {
    if (q.trim().length < 2) { setResults(null); return }
    setLoading(true)
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
      const data = await res.json()
      setResults(data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim().length < 2) return
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    doSearch(query.trim())
  }

  const totalResults = results
    ? results.blog.length + results.community.length + results.library.length
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px]">

      {/* Search hero */}
      <div className="bg-gradient-to-br from-teal-deep to-teal-dark py-14 px-[5%] text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-display text-[2rem] font-bold mb-6">Search letsthinkpositive</h1>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search articles, stories, library…"
              className="flex-1 px-5 py-3.5 rounded-full text-[0.95rem] text-charcoal bg-white outline-none focus:ring-2 focus:ring-amber/60"
            />
            <button type="submit"
              className="bg-amber text-charcoal px-6 py-3.5 rounded-full font-semibold text-[0.9rem] hover:bg-amber-soft transition-colors flex-shrink-0">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto py-10 px-[5%]">

        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
            </div>
          </div>
        )}

        {!loading && results && initialQ && (
          <>
            <p className="text-text-xlight text-[0.85rem] mb-8">
              {totalResults > 0
                ? <>{totalResults} result{totalResults !== 1 ? 's' : ''} for <strong className="text-charcoal">&ldquo;{initialQ}&rdquo;</strong></>
                : <>No results for <strong className="text-charcoal">&ldquo;{initialQ}&rdquo;</strong> — try a different term</>
              }
            </p>

            {/* Blog results */}
            {results.blog.length > 0 && (
              <section className="mb-10">
                <h2 className="text-[0.72rem] font-bold text-teal-mid uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span>✍️</span> Blog Posts
                </h2>
                <div className="space-y-3">
                  {results.blog.map((r, i) => (
                    <Link key={i} href={r.href}
                      className="block bg-white border border-teal-light rounded-[18px] px-5 py-4 no-underline hover:shadow-lift hover:-translate-y-0.5 transition-all group">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-[0.95rem] text-charcoal group-hover:text-teal-deep transition-colors mb-1">{r.title}</h3>
                          <p className="text-text-mid text-[0.83rem] leading-[1.65] line-clamp-2">{r.excerpt}</p>
                        </div>
                        <span className="text-teal-deep flex-shrink-0 mt-0.5">→</span>
                      </div>
                      <div className="flex gap-3 mt-2">
                        <span className="text-[0.7rem] bg-teal-ghost text-teal-mid px-2 py-0.5 rounded-full">{r.tag}</span>
                        <span className="text-[0.7rem] text-text-xlight">{r.date}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Library results */}
            {results.library.length > 0 && (
              <section className="mb-10">
                <h2 className="text-[0.72rem] font-bold text-teal-mid uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span>📚</span> Library Articles
                </h2>
                <div className="space-y-3">
                  {results.library.map((r, i) => (
                    <Link key={i} href={r.href}
                      className="block bg-white border border-teal-light rounded-[18px] px-5 py-4 no-underline hover:shadow-lift hover:-translate-y-0.5 transition-all group">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-[0.95rem] text-charcoal group-hover:text-teal-deep transition-colors mb-1">{r.title}</h3>
                          <p className="text-text-mid text-[0.83rem] leading-[1.65] line-clamp-2">{r.excerpt}</p>
                        </div>
                        <span className="text-teal-deep flex-shrink-0 mt-0.5">→</span>
                      </div>
                      <span className="text-[0.7rem] bg-teal-ghost text-teal-mid px-2 py-0.5 rounded-full mt-2 inline-block">{r.category}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Community results */}
            {results.community.length > 0 && (
              <section className="mb-10">
                <h2 className="text-[0.72rem] font-bold text-teal-mid uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span>💬</span> Community Stories
                </h2>
                <div className="space-y-3">
                  {results.community.map((r, i) => (
                    <Link key={i} href={r.href}
                      className="block bg-white border border-teal-light rounded-[18px] px-5 py-4 no-underline hover:shadow-lift hover:-translate-y-0.5 transition-all group">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-[0.95rem] text-charcoal group-hover:text-teal-deep transition-colors mb-1">{r.title}</h3>
                          <p className="text-text-mid text-[0.83rem] leading-[1.65] line-clamp-2">{r.excerpt}</p>
                        </div>
                        <span className="text-teal-deep flex-shrink-0 mt-0.5">→</span>
                      </div>
                      <span className="text-[0.7rem] text-text-xlight mt-2 inline-block">— {r.author}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {totalResults === 0 && (
              <div className="text-center py-16">
                <p className="text-[3rem] mb-4">🔍</p>
                <p className="text-text-mid font-semibold mb-2">No results found</p>
                <p className="text-text-xlight text-[0.85rem]">Try searching for &ldquo;gratitude&rdquo;, &ldquo;sleep&rdquo;, &ldquo;anxiety&rdquo;, or &ldquo;mindfulness&rdquo;</p>
              </div>
            )}
          </>
        )}

        {/* Suggestions when no query */}
        {!initialQ && !loading && (
          <div className="text-center py-10">
            <p className="text-text-mid text-[0.9rem] mb-6">Popular searches</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['gratitude', 'anxiety', 'sleep', 'mindfulness', 'affirmations', 'self-care', 'breathing', 'journaling'].map(s => (
                <button key={s} onClick={() => { setQuery(s); router.push(`/search?q=${s}`); doSearch(s) }}
                  className="px-4 py-2 bg-white border border-teal-light rounded-full text-[0.85rem] text-text-mid hover:border-teal-mid hover:text-teal-deep transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return <Suspense><SearchInner /></Suspense>
}
