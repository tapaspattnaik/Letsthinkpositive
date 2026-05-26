import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Real words from real lives — stories, lessons, and ideas from the letsthinkpositive community.',
}

const filters = ['All', 'Mindset', 'Wellness', 'Career', 'Student Life', 'Habits']

export default function BlogPage() {
  const posts = getAllPosts()

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
          <div className="flex gap-3 flex-wrap justify-center mt-8">
            {filters.map((f, i) => (
              <span key={f}
                className={`px-5 py-2 rounded-full border text-[0.85rem] font-medium cursor-default
                  ${i === 0 ? 'bg-teal-deep text-white border-teal-deep' : 'bg-white text-text-mid border-teal-light'}`}>
                {f}
              </span>
            ))}
          </div>
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
            <Link href="/contact"
              className="flex-shrink-0 bg-amber text-charcoal px-6 py-3 rounded-full font-semibold text-[0.92rem] no-underline hover:bg-amber-soft transition-colors whitespace-nowrap">
              Submit Your Post →
            </Link>
          </div>

          {/* Posts grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
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
                  <span className="text-[0.76rem] text-text-xlight">By {post.author} · {new Date(post.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                </div>
              </Link>
            ))}

            {/* Community placeholder */}
            <div className="bg-teal-ghost rounded-[24px] overflow-hidden border-2 border-dashed border-teal-light">
              <div className="h-2 bg-teal-light" />
              <div className="p-7 text-center">
                <span className="text-[2rem]">✍️</span>
                <h3 className="font-body font-semibold text-[1rem] text-teal-deep mt-3 mb-2">Your story could live right here</h3>
                <p className="text-[0.86rem] text-text-light leading-[1.7]">We welcome community posts. If it&apos;s genuine and comes from the heart, it has a home on this blog.</p>
              </div>
              <div className="px-7 py-4 border-t border-teal-light/50 flex justify-center">
                <Link href="/contact" className="text-[0.82rem] font-semibold text-teal-mid no-underline hover:text-teal-deep transition-colors">
                  Submit your post →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
