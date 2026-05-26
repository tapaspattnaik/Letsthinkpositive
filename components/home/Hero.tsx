import Link from 'next/link'

export function Hero() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-teal-dark via-teal-deep to-[#1E5A5A] flex items-center px-[5%] pt-[120px] pb-[80px] relative overflow-hidden">
      {/* ambient glows */}
      <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(232,160,32,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[5%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(45,155,138,0.2)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
        {/* Content */}
        <div>
          <div className="flex items-center gap-3 mb-6 text-amber-soft text-[0.78rem] font-semibold tracking-[0.15em] uppercase before:content-[''] before:w-8 before:h-0.5 before:bg-amber before:rounded before:flex-shrink-0">
            where every thought begins with hope
          </div>
          <h1 className="font-display text-[clamp(2.4rem,4vw,3.6rem)] font-bold leading-[1.15] text-white mb-6">
            You don&apos;t need a cape to{' '}
            <em className="text-amber-soft not-italic italic">change the world.</em>
          </h1>
          <p className="text-white/75 text-[1.05rem] leading-[1.8] mb-10 max-w-[480px]">
            You just need to change one thought. And then another. Welcome to a space built by someone who has been through the hard days — and found a way through.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/about" className="inline-flex items-center gap-2 bg-amber text-charcoal px-8 py-3.5 rounded-full font-semibold text-[0.95rem] no-underline hover:bg-amber-soft hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(232,160,32,0.3)] transition-all">
              Meet Tapas ↗
            </Link>
            <Link href="/blog" className="inline-flex items-center gap-2 border border-white/35 text-white px-8 py-3.5 rounded-full font-medium text-[0.95rem] no-underline hover:border-white hover:bg-white/8 transition-all">
              Read the Blog
            </Link>
          </div>
        </div>

        {/* Animated symbol */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <div className="relative w-[380px] h-[380px] flex items-center justify-center">
            {/* Rings — outer rotates CW, mid CCW, inner CW; dashed so rotation is visible */}
            {(['animate-ring-outer', 'animate-ring-mid', 'animate-ring-inner'] as const).map((cls, i) => {
              const size = [100, 78, 58][i]
              const color = [
                'rgba(168,216,208,0.55)',
                'rgba(45,155,138,0.65)',
                'rgba(45,155,138,0.80)',
              ][i]
              const thickness = ['border-2', 'border-2', 'border-[3px]'][i]
              return (
                <div
                  key={i}
                  className={`absolute rounded-full border-dashed ${thickness} ${cls}`}
                  style={{ width: `${size}%`, height: `${size}%`, borderColor: color }}
                />
              )
            })}

            {/* Signal bars — independent scaleY waves, origin at bottom */}
            <div className="absolute flex gap-2.5 items-end" style={{ bottom: 'calc(50% + 76px)', left: '50%', transform: 'translateX(-50%)' }}>
              {(['animate-bar-1', 'animate-bar-2', 'animate-bar-3'] as const).map((cls, i) => (
                <div
                  key={i}
                  className={`w-[5px] rounded-full bg-amber ${cls}`}
                  style={{ height: `${[56, 84, 56][i]}px`, transformOrigin: 'bottom' }}
                />
              ))}
            </div>

            {/* Core — breathing glow */}
            <div className="w-[150px] h-[150px] rounded-full bg-gradient-to-br from-teal-mid to-teal-deep flex items-center justify-center relative z-10 animate-core-breathe">
              {/* Inner orb — lags behind core breathe */}
              <div className="w-[108px] h-[108px] rounded-full bg-teal-mid flex items-center justify-center animate-orb-breathe">
                {/* Arc cascade — outer fires first (delay 0), ripples inward */}
                <div className="absolute flex flex-col gap-2 items-center" style={{ bottom: 'calc(50% - 20px)' }}>
                  {[56, 38, 22].map((w, i) => (
                    <div
                      key={i}
                      className="border-[3px] border-amber border-b-0 rounded-t-[50px] animate-arc-fire"
                      style={{ width: `${w}px`, height: `${w / 2}px`, animationDelay: `${i * 0.6}s` }}
                    />
                  ))}
                </div>
                <div className="w-4 h-4 rounded-full bg-amber-pale" />
              </div>
            </div>
          </div>
          <p className="mt-8 font-display italic text-[0.93rem] text-white/55 tracking-wide">
            — where every thought begins with hope —
          </p>
        </div>
      </div>
    </section>
  )
}
