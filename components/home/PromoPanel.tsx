import Link from 'next/link'

export function PromoPanel() {
  return (
    <section className="py-10 px-[5%]">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-[#0F2040] to-[#1A3060] rounded-[28px] px-8 py-7 flex flex-col sm:flex-row items-center gap-5">
          <span className="text-[3rem] flex-shrink-0">🌛</span>
          <div className="flex-1 text-center sm:text-left">
            <span className="text-[0.68rem] font-bold tracking-[0.15em] uppercase text-amber-soft block mb-1">New Release</span>
            <p className="text-white font-semibold text-[1rem] leading-snug">
              Guided Sleep Stories — Drift off to a tranquil night&apos;s sleep with our latest audio collection.
            </p>
          </div>
          <Link href="/meditation"
            className="flex-shrink-0 bg-amber text-charcoal px-6 py-2.5 rounded-full font-semibold text-[0.88rem] no-underline hover:bg-amber-soft transition-colors whitespace-nowrap">
            Listen Now →
          </Link>
        </div>
      </div>
    </section>
  )
}
