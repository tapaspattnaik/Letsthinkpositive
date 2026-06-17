import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles, ALL_CATEGORIES } from '@/lib/library'

export const metadata: Metadata = {
  alternates: { canonical: '/library' },
  title: 'Wellness Library',
  description: 'Evidence-backed articles on mindfulness, sleep, gratitude, anxiety, and self-care — written to help you live better, one read at a time.',
}

const TAG_ICONS: Record<string, string> = {
  Mindfulness: '🧘', Sleep: '🌙', Gratitude: '💛', Anxiety: '🌬️',
  Relaxation: '☁️',  'Self-Care': '🌿', Movement: '👣', Affirmations: '⭐',
}

export default function LibraryPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const active   = searchParams.category ?? ''
  const articles = getAllArticles()
  const filtered = active ? articles.filter(a => a.category === active || a.tags.includes(active)) : articles
  const featured = articles.filter(a => a.featured)

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
            <span className="w-6 h-0.5 bg-amber rounded" /> Wellness Library
          </div>
          <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-snug mb-4">
            Read. Learn. <em className="italic text-amber-soft">Grow.</em>
          </h1>
          <p className="text-white/72 text-[1.05rem] leading-[1.8] max-w-[560px]">
            Evidence-backed articles on mindfulness, sleep, gratitude, and everyday wellbeing — written to help you live better, one read at a time.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-ivory border-b border-teal-light sticky top-[72px] z-[30] py-4 px-[5%]" style={{ top: 'var(--header-h, 72px)' }}>
        <div className="max-w-6xl mx-auto flex gap-2 flex-wrap">
          <Link href="/library"
            className={`px-4 py-1.5 rounded-full text-[0.82rem] font-medium transition-all no-underline ${
              !active ? 'bg-teal-deep text-white' : 'bg-teal-ghost text-teal-deep hover:bg-teal-light/40'
            }`}>
            All
          </Link>
          {ALL_CATEGORIES.map(cat => (
            <Link key={cat}
              href={`/library?category=${encodeURIComponent(cat)}`}
              className={`px-4 py-1.5 rounded-full text-[0.82rem] font-medium transition-all no-underline ${
                active === cat ? 'bg-teal-deep text-white' : 'bg-teal-ghost text-teal-deep hover:bg-teal-light/40'
              }`}>
              {TAG_ICONS[cat] ?? ''} {cat}
            </Link>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-14 px-[5%]">

        {/* Featured (only show when not filtering) */}
        {!active && featured.length > 0 && (
          <div className="mb-14">
            <h2 className="font-display text-[1.1rem] text-teal-deep font-semibold mb-6 flex items-center gap-2">
              ⭐ Featured Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.slice(0, 2).map(a => (
                <ArticleCard key={a.slug} article={a} featured />
              ))}
            </div>
          </div>
        )}

        {/* All / Filtered */}
        <div>
          {active && (
            <h2 className="font-display text-[1.1rem] text-teal-deep font-semibold mb-6">
              {TAG_ICONS[active] ?? ''} {active}
              <span className="text-text-xlight font-normal text-[0.85rem] ml-2">({filtered.length} articles)</span>
            </h2>
          )}
          {filtered.length === 0 ? (
            <p className="text-text-light text-center py-16">No articles in this category yet — check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(a => <ArticleCard key={a.slug} article={a} />)}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function ArticleCard({ article: a, featured = false }: { article: ReturnType<typeof getAllArticles>[number], featured?: boolean }) {
  return (
    <Link href={`/library/${a.slug}`}
      className={`group block bg-white rounded-[24px] border border-teal-light no-underline
        hover:-translate-y-1.5 hover:shadow-lift transition-all duration-300 overflow-hidden
        ${featured ? 'md:flex' : ''}`}>
      {/* Colour band */}
      <div className={`h-1.5 bg-gradient-to-r from-teal-mid to-amber ${featured ? 'md:w-1.5 md:h-auto' : ''}`} />
      <div className="p-7">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[0.7rem] font-bold tracking-[0.15em] uppercase text-teal-mid">
            {TAG_ICONS[a.category] ?? ''} {a.category}
          </span>
          <span className="text-text-xlight text-[0.7rem]">· {a.readTime} min read</span>
        </div>
        <h3 className="font-body font-bold text-[1.02rem] text-charcoal mb-2 leading-snug group-hover:text-teal-deep transition-colors">
          {a.title}
        </h3>
        <p className="text-[0.875rem] text-text-light leading-[1.7] mb-4 line-clamp-3">{a.excerpt}</p>
        <div className="flex items-center justify-between text-[0.78rem] text-text-xlight">
          <span>{a.author}</span>
          <span>{new Date(a.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
    </Link>
  )
}
