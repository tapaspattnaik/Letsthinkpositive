import { Hero }             from '@/components/home/Hero'
import { QuoteSection }     from '@/components/home/QuoteSection'
import { SuperbManSection } from '@/components/home/SuperbManSection'
import { Pillars }          from '@/components/home/Pillars'
import { WellnessPillars }  from '@/components/home/WellnessPillars'
import { FeatureCards }     from '@/components/home/FeatureCards'
import { PromoPanel }       from '@/components/home/PromoPanel'
import { BlogTeaser }       from '@/components/home/BlogTeaser'
import { StoryOfWeek }      from '@/components/home/StoryOfWeek'
import { Newsletter }       from '@/components/home/Newsletter'
import { DailyCheckIn }    from '@/components/home/DailyCheckIn'
import { FavouriteToolsBar } from '@/components/home/FavouriteToolsBar'
import { DailyRecipe }     from '@/components/home/DailyRecipe'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* Personalised quick-access strip — only shown when user has saved favourites */}
      <FavouriteToolsBar />
      <QuoteSection />
      <WellnessPillars />
      <section className="py-12 px-[5%] bg-ivory">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Personalised daily plan — shown only to logged-in users */}
          <DailyRecipe />
          <DailyCheckIn />
        </div>
      </section>
      <FeatureCards />
      <PromoPanel />
      <SuperbManSection />
      <Pillars />
      <BlogTeaser />
      <StoryOfWeek />

      {/* Contagious CTA */}
      <section className="text-center py-20 px-[5%] bg-gradient-to-br from-teal-dark to-teal-deep relative overflow-hidden">
        <div className="absolute -top-[30%] -right-[8%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(232,160,32,0.10)_0%,transparent_70%)] pointer-events-none" />
        <blockquote className="font-display text-[clamp(1.4rem,2.5vw,2.1rem)] italic text-white max-w-[740px] mx-auto mb-6 leading-[1.55] relative">
          &ldquo;Let&apos;s make this contagious — not the doubt, not the fear, but this: the quiet decision to keep going.&rdquo;
        </blockquote>
        <p className="text-white/78 text-[1rem] max-w-[580px] mx-auto mb-8 leading-[1.85] relative">
          Mahatma Gandhi spoke of three monkeys — see no evil, hear no evil, speak no evil. In today&apos;s world we cannot always control what surrounds us. But we can always control what we hold inside us.
        </p>
        <Link href="/contact" className="inline-flex items-center gap-2 bg-amber text-charcoal px-8 py-3.5 rounded-full font-semibold text-[0.95rem] no-underline hover:bg-amber-soft hover:-translate-y-0.5 transition-all relative">
          Join the Movement →
        </Link>
      </section>

      <Newsletter />
    </>
  )
}
