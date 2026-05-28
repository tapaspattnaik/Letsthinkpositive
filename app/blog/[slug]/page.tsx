import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPost, getAllPostSlugs, getAllPosts } from '@/lib/posts'
import { BlogInteractions } from '@/components/blog/BlogInteractions'
import { BlogSidebar }     from '@/components/blog/BlogSidebar'

export async function generateStaticParams() {
  return getAllPostSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://letsthinkpositive.com'
  const pageUrl = `${siteUrl}/blog/${params.slug}`

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: pageUrl,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      siteName: 'Let\'s Think Positive',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post     = await getPost(params.slug)
  if (!post) notFound()

  const allPosts = getAllPosts()

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white">
        <div className="max-w-[760px] mx-auto">
          <Link href="/blog"
            className="inline-flex items-center gap-2 text-teal-light text-[0.85rem] no-underline hover:text-white transition-colors mb-6">
            ← Back to Blog
          </Link>
          <span className="block text-[0.72rem] font-bold tracking-[0.15em] uppercase text-amber-soft mb-4">{post.tag}</span>
          <h1 className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold leading-snug mb-5">{post.title}</h1>
          <p className="text-white/70 text-[1rem] leading-[1.8] mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-3 text-[0.82rem] text-white/55">
            <span>By {post.author}</span>
            <span>·</span>
            <span>{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </section>

      {/* ── Body: article + sticky sidebar ──────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-[5%] py-14 xl:grid xl:grid-cols-[1fr_280px] xl:gap-12 xl:items-start">

        {/* Main column */}
        <div>
          <article
            className="prose prose-lg max-w-none
              prose-headings:font-display prose-headings:text-charcoal
              prose-h2:text-[1.5rem] prose-h2:mt-10 prose-h2:mb-4
              prose-p:text-text-mid prose-p:leading-[1.9] prose-p:text-[1.02rem]
              prose-strong:text-teal-deep prose-strong:font-semibold
              prose-a:text-teal-mid prose-a:no-underline hover:prose-a:text-teal-deep
              prose-blockquote:border-l-4 prose-blockquote:border-amber
              prose-blockquote:bg-teal-ghost prose-blockquote:rounded-r-card
              prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:not-italic
              prose-blockquote:text-teal-deep prose-blockquote:font-display prose-blockquote:italic
              prose-ul:text-text-mid prose-li:leading-[1.8]
              prose-hr:border-teal-light"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* Like, Comment, Share */}
          <div className="mt-10">
            <BlogInteractions slug={params.slug} title={post.title} />
          </div>
        </div>

        {/* Sticky right sidebar — desktop only */}
        <BlogSidebar
          slug={params.slug}
          title={post.title}
          tag={post.tag}
          allPosts={allPosts}
        />
      </div>

      {/* ── Footer CTA ──────────────────────────────────────────── */}
      <section className="bg-teal-ghost py-14 px-[5%]">
        <div className="max-w-[760px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-display text-[1.2rem] text-charcoal italic mb-1">Did this help?</p>
            <p className="text-text-light text-[0.92rem]">Share it with someone who might need it today.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link href="/blog"
              className="px-5 py-2.5 border border-teal-light rounded-full text-[0.88rem] font-medium text-text-mid no-underline hover:border-teal-mid hover:text-teal-deep transition-all">
              ← More posts
            </Link>
            <Link href="/coach"
              className="px-5 py-2.5 bg-teal-deep text-white rounded-full text-[0.88rem] font-medium no-underline hover:bg-teal-dark transition-colors">
              Talk to Bit →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
