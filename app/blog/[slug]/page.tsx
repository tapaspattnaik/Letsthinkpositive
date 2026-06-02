import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPost, getAllPostSlugs, getAllPosts, Post } from '@/lib/posts'
import { BlogInteractions } from '@/components/blog/BlogInteractions'
import { BlogSidebar }     from '@/components/blog/BlogSidebar'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface DbAuthor {
  id: number; name: string; bio: string | null; avatarUrl: string | null
  interests: string; currentStreak: number; badges: number
}

interface DbPostResult extends Post {
  dbAuthor?: DbAuthor
}

// Helper: look up a post in the DB if not found in filesystem
async function getDbPost(slug: string): Promise<DbPostResult | null> {
  try {
    const p = await prisma.userBlogPost.findFirst({
      where: { slug, status: 'approved' },
      include: {
        user: {
          select: {
            id: true, name: true, bio: true, avatarUrl: true,
            interests: true, currentStreak: true,
            _count: { select: { badges: true } },
          },
        },
      },
    })
    if (!p) return null
    return {
      slug:        p.slug ?? slug,
      title:       p.title,
      date:        p.createdAt.toISOString().slice(0, 10),
      tag:         p.category,
      author:      p.user?.name ?? 'Community Member',
      excerpt:     p.excerpt ?? '',
      contentHtml: p.body,
      dbAuthor: p.user ? {
        id:            p.user.id,
        name:          p.user.name,
        bio:           p.user.bio,
        avatarUrl:     p.user.avatarUrl,
        interests:     p.user.interests,
        currentStreak: p.user.currentStreak,
        badges:        p.user._count.badges,
      } : undefined,
    }
  } catch { return null }
}

export async function generateStaticParams() {
  return getAllPostSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = (await getPost(slug)) ?? (await getDbPost(slug))
  if (!post) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://letsthinkpositive.com'
  const pageUrl = `${siteUrl}/blog/${slug}`

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
    alternates: { canonical: pageUrl },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // Try filesystem first, then DB (approved user posts)
  const fsPost   = await getPost(slug)
  const dbResult = fsPost ? null : await getDbPost(slug)
  const post     = fsPost ?? dbResult
  if (!post) notFound()
  const dbAuthor = (dbResult as DbPostResult | null)?.dbAuthor

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
            <BlogInteractions slug={slug} title={post.title} />
          </div>

          {/* ── Author snapshot — shown for user-submitted posts ── */}
          {dbAuthor && (
            <div className="mt-10 bg-gradient-to-br from-teal-ghost to-white border border-teal-light rounded-[24px] p-6">
              <p className="text-[0.7rem] font-bold text-text-xlight uppercase tracking-widest mb-4">About the Author</p>
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {dbAuthor.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={dbAuthor.avatarUrl} alt={dbAuthor.name} referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-mid to-teal-deep flex items-center justify-center text-white font-display font-bold text-[1.6rem] border-2 border-white shadow-sm">
                      {dbAuthor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3 className="font-display font-bold text-charcoal text-[1.1rem]">{dbAuthor.name}</h3>
                    {dbAuthor.currentStreak > 0 && (
                      <span className="flex items-center gap-1 bg-amber/15 text-amber text-[0.72rem] font-bold px-2.5 py-0.5 rounded-full">
                        🔥 {dbAuthor.currentStreak}-day streak
                      </span>
                    )}
                    {dbAuthor.badges > 0 && (
                      <span className="flex items-center gap-1 bg-teal-ghost text-teal-deep text-[0.72rem] font-bold px-2.5 py-0.5 rounded-full">
                        🏅 {dbAuthor.badges} badge{dbAuthor.badges !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {dbAuthor.bio && (
                    <p className="text-text-mid text-[0.9rem] leading-[1.75] mb-3">{dbAuthor.bio}</p>
                  )}

                  {/* Interests */}
                  {dbAuthor.interests && (
                    <div className="flex flex-wrap gap-1.5">
                      {dbAuthor.interests.split(',').filter(Boolean).slice(0, 5).map(i => (
                        <span key={i} className="bg-white border border-teal-light text-teal-deep text-[0.72rem] font-medium px-2.5 py-0.5 rounded-full">
                          {i.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link href={`/profile/${dbAuthor.id}`}
                    className="inline-flex items-center gap-1.5 mt-3 text-teal-mid text-[0.82rem] font-semibold no-underline hover:text-teal-deep transition-colors">
                    View profile →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Author credit for filesystem posts (Tapas-written) */}
          {!dbAuthor && (
            <div className="mt-10 flex items-center gap-4 bg-teal-ghost/50 border border-teal-light rounded-[20px] px-6 py-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-mid to-teal-deep flex items-center justify-center text-white font-bold text-[1.2rem] flex-shrink-0">
                T
              </div>
              <div>
                <p className="font-bold text-charcoal text-[0.95rem]">{post.author}</p>
                <p className="text-text-xlight text-[0.78rem]">Founder · letsthinkpositive.com</p>
                <Link href="/about" className="text-teal-mid text-[0.78rem] font-semibold no-underline hover:text-teal-deep transition-colors mt-0.5 inline-block">
                  Meet Tapas →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sticky right sidebar — desktop only */}
        <BlogSidebar
          slug={slug}
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
