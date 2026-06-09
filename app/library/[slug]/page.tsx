import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getArticle, getAllArticleSlugs, getAllArticles } from '@/lib/library'
import { TranslateBanner } from '@/components/TranslateBanner'
import { JsonLd } from '@/components/JsonLd'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return getAllArticleSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return {}
  return { title: article.title, description: article.excerpt }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const allArticles = getAllArticles()
  const related = article.relatedSlugs.length
    ? allArticles.filter(a => article.relatedSlugs.includes(a.slug))
    : allArticles.filter(a => a.slug !== article.slug && a.category === article.category).slice(0, 2)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://letsthinkpositive.com'
  const pageUrl = `${siteUrl}/library/${article.slug}`
  const logoUrl = `${siteUrl}/icons/icon-512.png`

  return (
    <>
      {/* ── Structured data: BreadcrumbList + Article ──────────── */}
      <JsonLd data={[
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',    item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Library', item: `${siteUrl}/library` },
            { '@type': 'ListItem', position: 3, name: article.title, item: pageUrl },
          ],
        },
        {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        url: pageUrl,
        datePublished: article.date,
        dateModified: article.date,
        author: {
          '@type': 'Person',
          name: article.author,
          description: article.authorBio || undefined,
        },
        publisher: {
          '@type': 'Organization',
          name: 'letsthinkpositive',
          logo: { '@type': 'ImageObject', url: logoUrl },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
        keywords: article.tags.join(', '),
        articleSection: article.category,
        ...(article.image ? { image: article.image.startsWith('http') ? article.image : `${siteUrl}${article.image}` } : {}),
          timeRequired: `PT${article.readTime}M`,
        },
      ]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white">
        <div className="max-w-[760px] mx-auto">
          <Link href="/library"
            className="inline-flex items-center gap-2 text-teal-light text-[0.85rem] no-underline hover:text-white transition-colors mb-6">
            ← Back to Library
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[0.7rem] font-bold tracking-[0.15em] uppercase text-amber-soft">
              {article.category}
            </span>
            <span className="text-white/40 text-[0.7rem]">·</span>
            <span className="text-white/55 text-[0.78rem]">{article.readTime} min read</span>
          </div>
          <h1 className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold leading-snug mb-5">{article.title}</h1>
          <p className="text-white/70 text-[1rem] leading-[1.8] mb-6">{article.excerpt}</p>
          <div className="flex items-center gap-3 text-[0.82rem] text-white/55">
            <span>By {article.author}</span>
            <span>·</span>
            <span>{new Date(article.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          {/* Tags */}
          <div className="flex gap-2 flex-wrap mt-5">
            {article.tags.map(tag => (
              <Link key={tag} href={`/library?category=${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[0.72rem] text-white/70 no-underline hover:bg-white/20 transition-colors">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-[760px] mx-auto py-16 px-[5%]">
        <TranslateBanner />
        <div
          className="prose prose-lg max-w-none
            prose-headings:font-display prose-headings:text-charcoal
            prose-h2:text-[1.5rem] prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-[1.15rem] prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-teal-deep
            prose-p:text-text-mid prose-p:leading-[1.9] prose-p:text-[1.02rem]
            prose-strong:text-teal-deep prose-strong:font-semibold
            prose-a:text-teal-mid prose-a:no-underline hover:prose-a:text-teal-deep
            prose-blockquote:border-l-4 prose-blockquote:border-amber
            prose-blockquote:bg-teal-ghost prose-blockquote:rounded-r-card
            prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:not-italic
            prose-blockquote:text-teal-deep prose-blockquote:font-display prose-blockquote:italic
            prose-ul:text-text-mid prose-li:leading-[1.8]
            prose-hr:border-teal-light"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />
      </article>

      {/* Author Bio */}
      {article.authorBio && (
        <section className="max-w-[760px] mx-auto px-[5%] pb-12">
          <div className="bg-teal-ghost border border-teal-light rounded-[24px] p-8 flex gap-5 items-start">
            <div className="w-12 h-12 rounded-full bg-teal-mid flex items-center justify-center text-white font-bold text-[1.1rem] flex-shrink-0">
              {article.author.charAt(0)}
            </div>
            <div>
              <p className="font-body font-bold text-teal-deep mb-1">{article.author}</p>
              <p className="text-[0.88rem] text-text-light leading-[1.7]">{article.authorBio}</p>
            </div>
          </div>
        </section>
      )}

      {/* Related articles */}
      {related.length > 0 && (
        <section className="bg-ivory py-14 px-[5%]">
          <div className="max-w-[760px] mx-auto">
            <h2 className="font-display text-[1.3rem] text-charcoal font-semibold mb-6">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {related.map(a => (
                <Link key={a.slug} href={`/library/${a.slug}`}
                  className="group block bg-white border border-teal-light rounded-[20px] p-6 no-underline hover:-translate-y-1 hover:shadow-lift transition-all">
                  <span className="text-[0.7rem] font-bold tracking-[0.15em] uppercase text-teal-mid block mb-2">{a.category}</span>
                  <h3 className="font-body font-bold text-[0.97rem] text-charcoal mb-1 group-hover:text-teal-deep transition-colors leading-snug">{a.title}</h3>
                  <p className="text-[0.82rem] text-text-xlight">{a.readTime} min read</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="bg-teal-ghost py-14 px-[5%]">
        <div className="max-w-[760px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-display text-[1.2rem] text-charcoal italic mb-1">Found this helpful?</p>
            <p className="text-text-light text-[0.92rem]">Share it with someone who needs it today.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link href="/library"
              className="px-5 py-2.5 border border-teal-light rounded-full text-[0.88rem] font-medium text-text-mid no-underline hover:border-teal-mid hover:text-teal-deep transition-all">
              ← More articles
            </Link>
            <Link href="/coach"
              className="px-5 py-2.5 bg-teal-deep text-white rounded-full text-[0.88rem] font-medium no-underline hover:bg-teal-dark transition-colors">
              Talk to Coach →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
