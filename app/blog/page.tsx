import Link from 'next/link'
import { getAllPosts, PostMeta } from '@/lib/posts'
import { BlogFilter } from '@/components/blog/BlogFilter'
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/blog' },
}


export const dynamic = 'force-dynamic'  // always fetch fresh approved posts

export default async function BlogPage() {
  // 1. Filesystem MDX posts (editorial / Tapas-written)
  const fsPosts: PostMeta[] = getAllPosts()

  // 2. User-submitted posts that have been approved by admin
  let userPosts: PostMeta[] = []
  try {
    const dbPosts = await prisma.userBlogPost.findMany({
      where:   { status: 'approved' },
      orderBy: { createdAt: 'desc' },
      select: {
        slug:      true,
        title:     true,
        excerpt:   true,
        category:  true,
        createdAt: true,
        user: { select: { name: true } },
      },
    })
    userPosts = dbPosts.map(p => ({
      slug:    p.slug ?? `user-post-${p.title.toLowerCase().replace(/\s+/g, '-').slice(0, 40)}`,
      title:   p.title,
      date:    p.createdAt.toISOString().slice(0, 10),
      tag:     p.category,
      author:  p.user?.name ?? 'Community Member',
      excerpt: p.excerpt ?? '',
    }))
  } catch {
    // DB unavailable — fall back to filesystem-only posts gracefully
  }

  // 3. Merge, de-duplicate by slug, sort newest first
  const seen   = new Set<string>()
  const allPosts: PostMeta[] = [...userPosts, ...fsPosts].filter(p => {
    if (seen.has(p.slug)) return false
    seen.add(p.slug)
    return true
  })

  return (
    <>
      {/* Hero */}
      <section className="bg-teal-ghost py-24 px-[5%] text-center">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 text-teal-mid text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4 section-label">
            The Community&apos;s Voice
          </div>
          <h1 className="font-display text-[clamp(1.9rem,3vw,2.8rem)] text-charcoal leading-snug mb-4">
            Real words from <em className="text-teal-deep italic">real lives</em>
          </h1>
          <p className="text-text-light text-[1.05rem] leading-[1.8] max-w-[560px] mx-auto">
            Every piece here comes from a real human being who has something genuine to say — stories, lessons, and small ideas that grew into something worth sharing out loud.
          </p>
        </div>
      </section>

      <section className="py-16 px-[5%]">
        <div className="max-w-6xl mx-auto">
          {/* Submit banner */}
          <div className="bg-gradient-to-r from-teal-deep to-teal-mid rounded-[24px] p-8 flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
            <div>
              <h3 className="font-display text-[1.4rem] text-white mb-1">Your story deserves to be heard 📝</h3>
              <p className="text-white/75 text-[0.92rem]">Have a lesson, a turning point, or a thought that could help someone? Write it.</p>
            </div>
            <Link href="/blog/submit"
              className="flex-shrink-0 bg-amber text-charcoal px-6 py-3 rounded-full font-semibold text-[0.92rem] no-underline hover:bg-amber-soft transition-colors whitespace-nowrap">
              Submit Your Post →
            </Link>
          </div>

          {/* Filter buttons + filtered post grid — client island */}
          <BlogFilter posts={allPosts} />
        </div>
      </section>
    </>
  )
}
