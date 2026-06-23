'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface UserResult   { id: number; name: string; avatar?: string|null; bio?: string|null; interests: string[]; badges: number; href: string }
interface CircleResult { id: number; name: string; slug: string; description: string; icon: string; members: number; posts: number; href: string }
interface PostResult   { title: string; excerpt: string; href: string; tag: string; date: string; author: string; avatar?: string|null }
interface CommResult   { title: string; excerpt: string; href: string; author: string; avatar?: string|null; likes: number; tags: string[] }
interface LibResult    { title: string; excerpt: string; href: string; category: string }
interface Results {
  users: UserResult[]; circles: CircleResult[]
  blog: PostResult[]; userPosts: PostResult[]
  community: CommResult[]; library: LibResult[]
  restricted?: boolean
}

const ALL_FILTERS = [
  { key: 'all',       label: 'All',       icon: '🔍', social: false },
  { key: 'users',     label: 'People',    icon: '👤', social: true  },
  { key: 'circles',   label: 'Circles',   icon: '🔒', social: true  },
  { key: 'blog',      label: 'Blog',      icon: '✍️', social: false },
  { key: 'community', label: 'Community', icon: '💛', social: true  },
  { key: 'library',   label: 'Library',   icon: '📚', social: false },
] as const
type FilterKey = typeof ALL_FILTERS[number]['key']

function timeAgo(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days < 7)  return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function Avatar({ src, name, size = 36 }: { src?: string | null; name: string; size?: number }) {
  if (src) return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} referrerPolicy="no-referrer"
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }} />
  )
  return (
    <div className="rounded-full bg-teal-ghost flex items-center justify-center flex-shrink-0 font-bold text-teal-deep"
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function SearchInner() {
  const params   = useSearchParams()
  const router   = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const debRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { data: session, status: authStatus } = useSession()
  const isLoggedIn = !!session?.user

  const initialQ = params.get('q') ?? ''
  const initialF = (params.get('type') ?? 'all') as FilterKey

  // Only show social filters when logged in
  const FILTERS = authStatus === 'loading'
    ? ALL_FILTERS.filter(f => !f.social)
    : ALL_FILTERS.filter(f => isLoggedIn || !f.social)

  const [query,   setQuery]   = useState(initialQ)
  const [filter,  setFilter]  = useState<FilterKey>(initialF)
  const [results, setResults] = useState<Results | null>(null)
  const [loading, setLoading] = useState(false)
  const [sugs,    setSugs]    = useState<string[]>([])
  const [showSug, setShowSug] = useState(false)
  const [recent,  setRecent]  = useState<string[]>([])

  useEffect(() => {
    inputRef.current?.focus()
    try {
      const s = localStorage.getItem('ltp-search-recent')
      if (s) setRecent(JSON.parse(s).slice(0, 5))
    } catch { /* ignore */ }
  }, [])

  const doSearch = useCallback(async (q: string, f: FilterKey) => {
    if (q.trim().length < 2) { setResults(null); setLoading(false); return }
    setLoading(true)
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&type=${f}`)
      setResults(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (initialQ) { setQuery(initialQ); doSearch(initialQ, initialF) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ, initialF])

  // Live suggestions debounced
  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current)
    if (query.length < 2) { setSugs([]); return }
    debRef.current = setTimeout(async () => {
      try {
        const data = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=all`).then(r => r.json()) as Results
        setSugs([
          ...data.users.map(u => u.name),
          ...data.circles.map(c => c.name),
          ...data.blog.map(p => p.title),
          ...data.userPosts.map(p => p.title),
        ].filter(Boolean).slice(0, 6))
      } catch { setSugs([]) }
    }, 220)
  }, [query])

  function saveRecent(q: string) {
    const u = [q, ...recent.filter(r => r !== q)].slice(0, 5)
    setRecent(u)
    try { localStorage.setItem('ltp-search-recent', JSON.stringify(u)) } catch { /* ignore */ }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim(); if (!q) return
    setShowSug(false); saveRecent(q)
    router.push(`/search?q=${encodeURIComponent(q)}&type=${filter}`)
    doSearch(q, filter)
  }

  function changeFilter(f: FilterKey) {
    setFilter(f)
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query)}&type=${f}`)
      doSearch(query, f)
    }
  }

  function pickSug(s: string) {
    setQuery(s); setShowSug(false); saveRecent(s)
    router.push(`/search?q=${encodeURIComponent(s)}&type=${filter}`)
    doSearch(s, filter)
  }

  const total = results
    ? results.users.length + results.circles.length + results.blog.length +
      results.userPosts.length + results.community.length + results.library.length
    : 0

  function hl(text: string) {
    if (!query) return text
    try {
      const e = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return text.replace(new RegExp(`(${e})`, 'gi'), '<strong>$1</strong>')
    } catch { return text }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost/50 to-ivory pt-[72px]">

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-deep to-teal-dark py-12 px-[5%]">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-[1.8rem] sm:text-[2.2rem] text-white font-bold mb-6 text-center">
            Search everything 🔍
          </h1>

          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center bg-white rounded-[18px] shadow-lift">
              <svg className="w-5 h-5 text-text-xlight ml-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
              </svg>
              <input ref={inputRef} value={query}
                onChange={e => { setQuery(e.target.value); setShowSug(true) }}
                onFocus={() => setShowSug(true)}
                onBlur={() => setTimeout(() => setShowSug(false), 160)}
                placeholder="Search people, circles, blog posts, community…"
                className="flex-1 px-4 py-4 text-[1rem] outline-none bg-transparent text-charcoal placeholder:text-text-xlight"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setResults(null); setSugs([]) }}
                  className="px-3 text-text-xlight hover:text-charcoal text-[1.4rem] leading-none transition-colors">×</button>
              )}
              <button type="submit"
                className="bg-teal-deep text-white m-1.5 px-5 py-2.5 rounded-[12px] font-semibold text-[0.9rem] hover:bg-teal-dark transition-colors flex-shrink-0">
                Search
              </button>
            </div>

            {/* Dropdown */}
            {showSug && (sugs.length > 0 || (query.length < 2 && recent.length > 0)) && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[16px] shadow-lift border border-teal-light z-50 overflow-hidden">
                {query.length < 2 && recent.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-4 pt-3 pb-1">
                      <p className="text-[0.65rem] font-bold text-text-xlight uppercase tracking-widest">Recent</p>
                      <button onMouseDown={() => { setRecent([]); localStorage.removeItem('ltp-search-recent') }}
                        className="text-[0.68rem] text-text-xlight hover:text-red-400 transition-colors">Clear</button>
                    </div>
                    {recent.map(r => (
                      <button key={r} onMouseDown={() => pickSug(r)}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-teal-ghost transition-colors text-[0.88rem] text-text-mid">
                        <span className="text-text-xlight text-[0.8rem]">⏱</span>{r}
                      </button>
                    ))}
                  </>
                )}
                {sugs.map(s => (
                  <button key={s} onMouseDown={() => pickSug(s)}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-teal-ghost transition-colors text-[0.88rem] text-charcoal">
                    <svg className="w-4 h-4 text-teal-mid flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                    </svg>
                    <span dangerouslySetInnerHTML={{ __html: hl(s) }} />
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap mt-4 justify-center">
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => changeFilter(f.key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[0.82rem] font-semibold transition-all
                  ${filter === f.key
                    ? 'bg-white text-teal-deep shadow-sm'
                    : 'bg-white/15 text-white/80 hover:bg-white/25 border border-white/20'}`}>
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          {/* Sign-in nudge for guests */}
          {!isLoggedIn && authStatus !== 'loading' && (
            <div className="mt-4 flex items-center justify-center gap-3 bg-white/10 border border-white/20 rounded-[14px] px-5 py-3">
              <span className="text-[1.1rem]">🔒</span>
              <p className="text-white/80 text-[0.82rem]">
                <strong className="text-white">Sign in</strong> to also search people, circles, and community posts
              </p>
              <Link href="/login" className="flex-shrink-0 bg-white text-teal-deep text-[0.78rem] font-bold px-3.5 py-1.5 rounded-full no-underline hover:bg-teal-ghost transition-colors">
                Sign in →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-[5%] py-8">

        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => <span key={i} className="w-3 h-3 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
            </div>
          </div>
        )}

        {!loading && !results && !query && (
          <div className="text-center py-12">
            <p className="text-[3.5rem] mb-4">✨</p>
            <p className="font-display font-bold text-charcoal text-[1.3rem] mb-2">Search letsthinkpositive</p>
            <p className="text-text-mid text-[0.92rem] max-w-sm mx-auto mb-8">
              {isLoggedIn
                ? 'Find people, circles, blog posts, and wellness articles.'
                : 'Find blog posts and wellness articles. Sign in to also search people, circles, and community posts.'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
              {(isLoggedIn
                ? [
                    ['👤','People','Find community members'],
                    ['🔒','Circles','Private wellness groups'],
                    ['✍️','Blog','Stories & articles'],
                    ['💛','Community','Shared posts & wishes'],
                    ['📚','Library','Wellness articles'],
                    ['🔍','All','Search everything'],
                  ]
                : [
                    ['✍️','Blog','Stories & articles'],
                    ['📚','Library','Wellness articles'],
                    ['🔍','All','Search everything'],
                  ]
              ).map(([icon, label, desc]) => (
                <button key={label} onClick={() => { changeFilter(label.toLowerCase() as FilterKey); inputRef.current?.focus() }}
                  className="bg-white border border-teal-light rounded-[14px] p-3.5 text-left hover:border-teal-mid hover:shadow-card transition-all">
                  <p className="font-semibold text-charcoal text-[0.85rem]">{icon} {label}</p>
                  <p className="text-text-xlight text-[0.72rem] mt-0.5">{desc}</p>
                </button>
              ))}
            </div>

            {/* Guest upgrade CTA */}
            {!isLoggedIn && authStatus !== 'loading' && (
              <div className="mt-8 inline-flex items-center gap-3 bg-teal-ghost border border-teal-light rounded-[16px] px-6 py-4 text-left max-w-sm">
                <span className="text-[1.8rem]">🔓</span>
                <div>
                  <p className="font-semibold text-teal-deep text-[0.9rem]">More results when you sign in</p>
                  <p className="text-text-xlight text-[0.78rem] mt-0.5 mb-2">Search people, circles & community posts</p>
                  <Link href="/login" className="text-white bg-teal-deep text-[0.78rem] font-bold px-4 py-1.5 rounded-full no-underline hover:bg-teal-dark transition-colors inline-block">
                    Sign in free →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && query.length >= 2 && results && total === 0 && (
          <div className="text-center py-16">
            <p className="text-[3rem] mb-3">🔍</p>
            <p className="font-display font-bold text-charcoal text-[1.1rem] mb-2">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-text-mid text-[0.88rem]">Try different keywords, or change the filter.</p>
          </div>
        )}

        {results && !loading && total > 0 && (
          <div className="space-y-8">
            <div className="flex items-center flex-wrap gap-3">
              <p className="text-text-xlight text-[0.82rem]">
                <strong className="text-charcoal">{total}</strong> result{total !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                {results.restricted && <span className="ml-1 text-text-xlight">(public content only)</span>}
              </p>
              {results.restricted && (
                <Link href={`/login?next=/search?q=${encodeURIComponent(query)}`}
                  className="text-teal-deep text-[0.8rem] font-semibold border border-teal-mid px-3 py-1 rounded-full no-underline hover:bg-teal-ghost transition-colors">
                  🔓 Sign in for people & community results
                </Link>
              )}
            </div>

            {/* People */}
            {results.users.length > 0 && (
              <section>
                <h2 className="font-bold text-charcoal text-[0.95rem] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-ghost flex items-center justify-center text-[0.8rem]">👤</span>
                  People <span className="text-text-xlight font-normal text-[0.8rem]">({results.users.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.users.map(u => (
                    <Link key={u.id} href={u.href}
                      className="flex items-start gap-3 bg-white border border-teal-light rounded-[16px] px-4 py-3.5 no-underline hover:border-teal-mid hover:shadow-card transition-all group">
                      <Avatar src={u.avatar} name={u.name} size={44} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-charcoal text-[0.93rem] group-hover:text-teal-deep transition-colors">{u.name}</p>
                        {u.bio && <p className="text-text-xlight text-[0.78rem] mt-0.5 line-clamp-1">{u.bio}</p>}
                        <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                          {u.interests.map(i => <span key={i} className="bg-teal-ghost text-teal-deep text-[0.63rem] font-medium px-2 py-0.5 rounded-full">{i}</span>)}
                          {u.badges > 0 && <span className="text-amber text-[0.72rem] font-semibold">🏅 {u.badges}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Circles */}
            {results.circles.length > 0 && (
              <section>
                <h2 className="font-bold text-charcoal text-[0.95rem] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-ghost flex items-center justify-center text-[0.8rem]">🔒</span>
                  Circles <span className="text-text-xlight font-normal text-[0.8rem]">({results.circles.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.circles.map(c => (
                    <Link key={c.id} href={c.href}
                      className="flex items-start gap-3 bg-white border border-teal-light rounded-[16px] px-4 py-3.5 no-underline hover:border-teal-mid hover:shadow-card transition-all group">
                      <span className="text-[2rem] flex-shrink-0">{c.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-charcoal text-[0.93rem] group-hover:text-teal-deep transition-colors">{c.name}</p>
                        <p className="text-text-xlight text-[0.78rem] mt-0.5 line-clamp-2">{c.description}</p>
                        <p className="text-text-xlight text-[0.72rem] mt-1.5">👥 {c.members} · 💬 {c.posts} posts</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Blog */}
            {(results.blog.length > 0 || results.userPosts.length > 0) && (
              <section>
                <h2 className="font-bold text-charcoal text-[0.95rem] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-ghost flex items-center justify-center text-[0.8rem]">✍️</span>
                  Blog Posts <span className="text-text-xlight font-normal text-[0.8rem]">({results.blog.length + results.userPosts.length})</span>
                </h2>
                <div className="space-y-2.5">
                  {[...results.blog, ...results.userPosts].map((p, i) => (
                    <Link key={i} href={p.href}
                      className="flex gap-4 bg-white border border-teal-light rounded-[16px] px-5 py-4 no-underline hover:border-teal-mid hover:shadow-card transition-all group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="bg-teal-ghost text-teal-deep text-[0.63rem] font-bold px-2 py-0.5 rounded-full uppercase">{p.tag}</span>
                          <span className="text-text-xlight text-[0.72rem]">{timeAgo(p.date)}</span>
                        </div>
                        <p className="font-bold text-charcoal text-[0.93rem] group-hover:text-teal-deep transition-colors line-clamp-1">{p.title}</p>
                        <p className="text-text-xlight text-[0.78rem] mt-0.5 line-clamp-2">{p.excerpt}</p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2 self-center">
                        <Avatar src={p.avatar} name={p.author} size={28} />
                        <span className="text-text-xlight text-[0.72rem] hidden sm:block max-w-[80px] truncate">{p.author}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Community */}
            {results.community.length > 0 && (
              <section>
                <h2 className="font-bold text-charcoal text-[0.95rem] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-ghost flex items-center justify-center text-[0.8rem]">💛</span>
                  Community Posts <span className="text-text-xlight font-normal text-[0.8rem]">({results.community.length})</span>
                </h2>
                <div className="space-y-2.5">
                  {results.community.map((p, i) => (
                    <Link key={i} href={p.href}
                      className="flex gap-3 bg-white border border-teal-light rounded-[16px] px-5 py-4 no-underline hover:border-teal-mid hover:shadow-card transition-all group">
                      <Avatar src={p.avatar} name={p.author} size={38} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="font-semibold text-charcoal text-[0.87rem]">{p.author}</p>
                          {p.tags.map(t => <span key={t} className="bg-amber/15 text-amber text-[0.62rem] font-semibold px-2 py-0.5 rounded-full">#{t}</span>)}
                        </div>
                        <p className="font-bold text-charcoal text-[0.9rem] group-hover:text-teal-deep transition-colors line-clamp-1">{p.title}</p>
                        <p className="text-text-xlight text-[0.78rem] mt-0.5 line-clamp-2">{p.excerpt}</p>
                        {p.likes > 0 && <p className="text-text-xlight text-[0.7rem] mt-1">❤️ {p.likes} likes</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Library */}
            {results.library.length > 0 && (
              <section>
                <h2 className="font-bold text-charcoal text-[0.95rem] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-ghost flex items-center justify-center text-[0.8rem]">📚</span>
                  Library Articles <span className="text-text-xlight font-normal text-[0.8rem]">({results.library.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.library.map((a, i) => (
                    <Link key={i} href={a.href}
                      className="bg-white border border-teal-light rounded-[16px] px-5 py-4 no-underline hover:border-teal-mid hover:shadow-card transition-all group block">
                      <span className="bg-purple-50 text-purple-700 text-[0.63rem] font-bold px-2 py-0.5 rounded-full uppercase">{a.category}</span>
                      <p className="font-bold text-charcoal text-[0.93rem] group-hover:text-teal-deep transition-colors mt-1.5 line-clamp-1">{a.title}</p>
                      <p className="text-text-xlight text-[0.78rem] mt-0.5 line-clamp-2">{a.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return <Suspense><SearchInner /></Suspense>
}
