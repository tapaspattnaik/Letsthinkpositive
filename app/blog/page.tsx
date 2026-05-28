import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { BlogFilter } from '@/components/blog/BlogFilter'

export default function BlogPage() {
  // getAllPosts uses Node.js `fs` — safe here because this is a SERVER component
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
          <BlogFilter posts={posts} />
        </div>
      </section>
    </>
  )
}
