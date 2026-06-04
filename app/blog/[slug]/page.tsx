import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPost, getAllPostSlugs, getAllPosts, Post } from '@/lib/posts'
import { BlogInteractions }  from '@/components/blog/BlogInteractions'
import { BlogSidebar }      from '@/components/blog/BlogSidebar'
import { TranslateBanner }  from '@/components/TranslateBanner'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface DbAuthor {
  id: number; name: string; bio: string | null; avatarUrl: string | null
  website: string | null; interests: string; currentStreak: number; badges: number
}

interface DbPostResult extends Post {
  dbAuthor?: DbAuthor
}

// Helper: look up an author from the DB by name (for filesystem posts)
async function getAuthorByName(name: string): Promise<DbAuthor | null> {
  try {
    const u = await prisma.user.findFirst({
      where: { name: { contains: name } },
      select: {
        id: true, name: true, bio: true, website: true, avatarUrl: true,
        interests: true, currentStreak: true,
        _count: { select: { badges: true } },
      },
    })
    if (!u) return null
    return { id: u.id, name: u.name, bio: u.bio, website: u.website, avatarUrl: u.avatarUrl,
      interests: u.interests, currentStreak: u.currentStreak, badges: u._count.badges }
  } catch { return null }
}

// Helper: look up a post in the DB if not found in filesystem
async function getDbPost(slug: string): Promise<DbPostResult | null> {
  try {
    const p = await prisma.userBlogPost.findFirst({
      where: { slug, status: 'approved' },
      include: {
        user: {
          select: {
            id: true, name: true, bio: true, website: true, avatarUrl: true,
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
        website:       p.user.website,
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

  // Include author bio snippet in description for richer social previews
  const authorBio = (post as DbPostResult).dbAuthor?.bio
  const fullDesc  = authorBio
    ? `${post.excerpt} — By ${post.author}: ${authorBio.slice(0, 100)}${authorBio.length > 100 ? '…' : ''}`
    : post.excerpt

  return {
    title: post.title,
    description: fullDesc,
    openGraph: {
      title: post.title,
      description: fullDesc,
      url: pageUrl,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      siteName: 'Let\'s Think Positive',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: fullDesc,
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

  // For DB posts: author from the user record
  // For filesystem posts: try to find the author in the DB by name
  const dbAuthor = (dbResult as DbPostResult | null)?.dbAuthor
    ?? (fsPost ? await getAuthorByName(fsPost.author) : null)

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
          <div className="flex items-center gap-3 text-[0.82rem] text-white/55 flex-wrap">
            <span>By {post.author}</span>
            <span>·</span>
            <span>{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Views tracked below
            </span>
          </div>
        </div>
      </section>

      {/* ── Body: article + sticky sidebar ──────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-[5%] py-14 xl:grid xl:grid-cols-[1fr_280px] xl:gap-12 xl:items-start">

        {/* Main column */}
        <div>
          <TranslateBanner />
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

          {/* ── About the Author — auto-generated for every post ──── */}
          <div className="mt-10 bg-gradient-to-br from-teal-ghost via-white to-teal-ghost/30 border border-teal-light rounded-[24px] overflow-hidden">
            {/* Header strip */}
            <div className="bg-gradient-to-r from-teal-deep to-teal-dark px-6 py-3 flex items-center gap-2">
              <span className="text-amber text-[0.72rem] font-bold uppercase tracking-widest">✍️ About the Author</span>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {dbAuthor?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={dbAuthor.avatarUrl} alt={dbAuthor.name} referrerPolicy="no-referrer"
                      className="w-[72px] h-[72px] rounded-full object-cover border-3 border-white shadow-lift" />
                  ) : (
                    <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-teal-mid to-teal-deep flex items-center justify-center text-white font-display font-bold text-[1.8rem] shadow-lift border-3 border-white">
                      {(dbAuthor?.name ?? post.author).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {/* Name + badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <h3 className="font-display font-bold text-charcoal text-[1.1rem]">
                      {dbAuthor?.name ?? post.author}
                    </h3>
                    {dbAuthor && dbAuthor.currentStreak > 0 && (
                      <span className="bg-amber/15 text-amber text-[0.68rem] font-bold px-2.5 py-0.5 rounded-full">
                        🔥 {dbAuthor.currentStreak}d streak
                      </span>
                    )}
                    {dbAuthor && dbAuthor.badges > 0 && (
                      <span className="bg-teal-ghost text-teal-deep text-[0.68rem] font-bold px-2.5 py-0.5 rounded-full">
                        🏅 {dbAuthor.badges} badge{dbAuthor.badges !== 1 ? 's' : ''}
                      </span>
                    )}
                    {!dbAuthor && (
                      <span className="bg-amber/15 text-amber text-[0.68rem] font-semibold px-2.5 py-0.5 rounded-full">
                        Founder
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  {dbAuthor?.bio ? (
                    <p className="text-text-mid text-[0.88rem] leading-[1.75] mb-3">{dbAuthor.bio}</p>
                  ) : !dbAuthor ? (
                    <p className="text-text-mid text-[0.88rem] leading-[1.75] mb-3">
                      Tapas Pattanaik is the founder of letsthinkpositive.com — a wellness platform built from lived experience. He writes on mental wellbeing, resilience, and living with intention.
                    </p>
                  ) : null}

                  {/* Interests */}
                  {dbAuthor?.interests && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {dbAuthor.interests.split(',').filter(Boolean).slice(0, 5).map(i => (
                        <span key={i} className="bg-white border border-teal-light text-teal-deep text-[0.7rem] font-medium px-2.5 py-0.5 rounded-full">
                          {i.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Profile + website links */}
                  {dbAuthor ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/profile/${dbAuthor.id}`}
                        className="inline-flex items-center gap-1.5 bg-teal-deep text-white text-[0.8rem] font-semibold px-4 py-2 rounded-full no-underline hover:bg-teal-dark transition-colors shadow-sm">
                        View {dbAuthor.name.split(' ')[0]}&apos;s profile →
                      </Link>
                      {dbAuthor.website && (
                        <a href={dbAuthor.website} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 border border-teal-light text-teal-deep text-[0.8rem] font-semibold px-4 py-2 rounded-full no-underline hover:bg-teal-ghost hover:border-teal-mid transition-colors">
                          🌐 Website ↗
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      <Link href="/about"
                        className="inline-flex items-center gap-1.5 bg-teal-deep text-white text-[0.8rem] font-semibold px-4 py-2 rounded-full no-underline hover:bg-teal-dark transition-colors shadow-sm">
                        About Tapas →
                      </Link>
                      <Link href="/profile"
                        className="inline-flex items-center gap-1.5 border border-teal-light text-teal-deep text-[0.8rem] font-semibold px-4 py-2 rounded-full no-underline hover:bg-teal-ghost transition-colors">
                        View profile
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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
