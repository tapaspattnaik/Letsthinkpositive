import Link from 'next/link'

const posts = [
  { tag: 'Mindset',      title: 'The Day I Stopped Looking for Superman',                      excerpt: 'As a kid, I wanted to be saved by a superhero. As an adult, I realised the world doesn\'t need more heroes — it needs more people who will sit down and truly listen.' },
  { tag: 'Wellness',     title: 'What Gandhi\'s 3 Monkeys Taught Me About Modern Life',        excerpt: 'I grew up with those three monkeys on the wall. I used to think it was simple. Then life happened — and I understood it completely differently.' },
  { tag: 'Student Life', title: 'You Are Not Behind. You Are Exactly Where You Need to Be.',   excerpt: 'Somewhere right now, a student is comparing their chapter 1 to someone else\'s chapter 20. This post is for them.' },
]

export function BlogTeaser() {
  return (
    <section className="bg-teal-ghost py-20 px-[5%]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 text-teal-mid text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4 section-label">
          From the Blog
        </div>
        <h2 className="font-display text-[clamp(1.9rem,3vw,2.8rem)] text-charcoal leading-snug mb-8">
          Fresh thoughts, <em className="text-teal-deep italic">straight from the heart</em>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(p => (
            <div key={p.title} className="bg-white rounded-[24px] overflow-hidden shadow-card border border-teal-light/30 hover:-translate-y-1.5 hover:shadow-lift transition-all duration-300 cursor-pointer">
              <div className="h-2 bg-gradient-to-r from-teal-mid to-amber" />
              <div className="p-7">
                <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-teal-mid mb-3 block">{p.tag}</span>
                <h3 className="font-display text-[1.12rem] text-charcoal leading-snug mb-3">{p.title}</h3>
                <p className="text-[0.87rem] text-text-light leading-[1.7]">{p.excerpt}</p>
              </div>
              <div className="px-7 py-4 border-t border-teal-ghost flex justify-between items-center">
                <Link href="/blog" className="text-[0.82rem] font-semibold text-teal-mid no-underline hover:text-teal-deep transition-colors">Read more →</Link>
                <span className="text-[0.76rem] text-text-xlight">By Tapas</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/blog" className="inline-flex items-center gap-2 bg-amber text-charcoal px-8 py-3.5 rounded-full font-semibold text-[0.95rem] no-underline hover:bg-amber-soft hover:-translate-y-0.5 transition-all">
            Read All Posts →
          </Link>
        </div>
      </div>
    </section>
  )
}
