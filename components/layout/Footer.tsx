import Link from 'next/link'

const pages = [
  { href: '/',         label: 'Home'        },
  { href: '/about',    label: 'About Tapas' },
  { href: '/blog',     label: 'Blog'        },
  { href: '/community',label: 'Community'   },
  { href: '/contact',  label: 'Contact'     },
]

const tools = [
  { href: '/journal',   label: 'Gratitude Journal' },
  { href: '/sounds',    label: 'Calm Sounds'       },
  { href: '/coach',     label: 'Calm Coach (AI)'   },
  { href: '/mood',      label: 'Mood Tracker'      },
  { href: '/habits',    label: 'Habit Tracker'     },
  { href: '/breathing', label: 'Breathing'         },
  { href: '/challenges',label: 'Challenges'        },
]

const legal = [
  { href: '/privacy',    label: 'Privacy Policy'    },
  { href: '/terms',      label: 'Terms & Conditions'},
  { href: '/disclaimer', label: 'Disclaimer'        },
]

export function Footer() {
  return (
    <footer className="bg-charcoal text-white/65 pt-14 pb-7 px-[5%]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

        {/* Brand */}
        <div>
          <p className="font-body text-[1.05rem] font-semibold mb-2">
            <span className="text-teal-mid font-light">lets</span>
            <span className="text-white font-bold">think</span>
            <span className="text-amber font-light">positive</span>
          </p>
          <p className="text-[0.87rem] leading-7 max-w-[260px]">
            A space built by someone who has been through the hard days, found a way through, and now walks beside you on yours.
          </p>
          <p className="text-teal-light italic text-[0.8rem] mt-1">— where every thought begins with hope —</p>
        </div>

        {/* Pages */}
        <nav aria-label="Footer pages">
          <h2 className="text-white text-[0.82rem] font-bold tracking-widest uppercase mb-4">Pages</h2>
          <ul className="space-y-2 list-none">
            {pages.map(p => (
              <li key={p.href}>
                <Link href={p.href} className="text-[0.86rem] text-white/55 no-underline hover:text-amber transition-colors">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Tools */}
        <nav aria-label="Footer tools">
          <h2 className="text-white text-[0.82rem] font-bold tracking-widest uppercase mb-4">Tools</h2>
          <ul className="space-y-2 list-none">
            {tools.map(t => (
              <li key={t.href}>
                <Link href={t.href} className="text-[0.86rem] text-white/55 no-underline hover:text-amber transition-colors">
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Legal */}
        <nav aria-label="Footer legal">
          <h2 className="text-white text-[0.82rem] font-bold tracking-widest uppercase mb-4">Legal</h2>
          <ul className="space-y-2 list-none">
            {legal.map(l => (
              <li key={l.href}>
                <Link href={l.href} className="text-[0.86rem] text-white/55 no-underline hover:text-amber transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <p className="text-[0.78rem] text-white/35 leading-[1.7]">
              Not a medical service. Content is for wellness education only.
            </p>
          </div>
        </nav>
      </div>

      <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row justify-between items-center gap-2 max-w-6xl mx-auto">
        <span className="text-[0.8rem]">© 2026 letsthinkpositive.com — <em className="text-amber-soft">Tapas Pattanaik</em></span>
        <nav aria-label="Legal links" className="flex gap-4">
          {legal.map(l => (
            <Link key={l.href} href={l.href} className="text-white/35 text-[0.78rem] hover:text-amber transition-colors no-underline">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
