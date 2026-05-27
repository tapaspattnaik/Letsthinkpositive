import Link from 'next/link'

const pages = [
  { href: '/',        label: 'Home'         },
  { href: '/about',   label: 'About Tapas'  },
  { href: '/blog',    label: 'Blog'         },
  { href: '/contact', label: 'Contact'      },
]

const features = [
  { href: '/journal', label: 'Gratitude Journal' },
  { href: '/sounds',  label: 'Keep Calm Sounds'  },
  { href: '/advisor', label: 'Bit Advisor (AI)'  },
]

const topics = [
  { label: 'Mindset' },
  { label: 'Career Growth' },
  { label: 'Habits' },
  { label: 'Student Life' },
  { label: 'Yoga — soon',          soon: true },
  { label: 'Positive Eating — soon', soon: true },
]

export function Footer() {
  return (
    <footer className="bg-charcoal text-white/65 pt-14 pb-7 px-[5%]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
        {/* Brand */}
        <div>
          <h3 className="font-body text-[1.05rem] font-semibold mb-2">
            <span className="text-teal-mid font-light">lets</span>
            <span className="text-white font-bold">think</span>
            <span className="text-amber font-light">positive</span>
          </h3>
          <p className="text-[0.87rem] leading-7 max-w-[260px]">
            A space built by someone who has been through the hard days, found a way through, and now walks beside you on yours.
          </p>
          <p className="text-teal-light italic text-[0.8rem] mt-1">— where every thought begins with hope —</p>
        </div>

        {/* Pages */}
        <div>
          <h4 className="text-white text-[0.82rem] font-bold tracking-widest uppercase mb-4">Pages</h4>
          <ul className="space-y-2">
            {pages.map(p => (
              <li key={p.href}><Link href={p.href} className="text-[0.86rem] text-white/55 no-underline hover:text-amber transition-colors">{p.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Features */}
        <div>
          <h4 className="text-white text-[0.82rem] font-bold tracking-widest uppercase mb-4">Tools</h4>
          <ul className="space-y-2">
            {features.map(f => (
              <li key={f.href}><Link href={f.href} className="text-[0.86rem] text-white/55 no-underline hover:text-amber transition-colors">{f.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Topics */}
        <div>
          <h4 className="text-white text-[0.82rem] font-bold tracking-widest uppercase mb-4">Topics</h4>
          <ul className="space-y-2">
            {topics.map(t => (
              <li key={t.label}>
                {t.soon
                  ? <span className="text-white/25 italic text-[0.8rem]">{t.label}</span>
                  : <span className="text-[0.86rem] text-white/55">{t.label}</span>
                }
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row justify-between items-center gap-2 max-w-6xl mx-auto">
        <span className="text-[0.8rem]">© 2026 letsthinkpositive.com — <em className="text-amber-soft">Tapas Pattanaik</em></span>
        <span className="text-white/35 text-[0.78rem]">Privacy Policy · Disclaimer</span>
      </div>
    </footer>
  )
}
