'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LtpLogo } from '@/components/ui/LtpLogo'

const links = [
  { href: '/',        label: 'Home'    },
  { href: '/about',   label: 'About'   },
  { href: '/blog',    label: 'Blog'    },
  { href: '/journal', label: 'Journal' },
  { href: '/sounds',  label: 'Calm'    },
  { href: '/advisor', label: 'Bit Advisor' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ivory/92 backdrop-blur-md border-b border-teal-light h-[72px] flex items-center justify-between px-[5%]">
      <Link href="/" className="flex items-center gap-2.5 no-underline hover:opacity-85 transition-opacity">
        <LtpLogo size={44} />
        <span className="font-body text-[1.1rem] leading-none">
          <span className="text-teal-mid font-light">lets</span>
          <span className="text-teal-deep font-bold">think</span>
          <span className="text-amber font-light">positive</span>
        </span>
      </Link>

      <ul className="flex items-center gap-7 list-none">
        {links.map(({ href, label }) => (
          <li key={href} className="hidden sm:block">
            <Link
              href={href}
              className={`text-[0.88rem] font-medium tracking-wide no-underline transition-colors relative
                after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5
                after:bg-amber after:rounded-sm after:scale-x-0 after:transition-transform after:origin-left
                hover:text-teal-deep hover:after:scale-x-100
                ${pathname === href ? 'text-teal-deep after:scale-x-100' : 'text-text-mid'}
              `}
            >
              {label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/contact"
            className="bg-teal-deep text-white text-[0.82rem] font-medium px-4 py-2 rounded-full no-underline hover:bg-teal-dark transition-colors"
          >
            Contact Us
          </Link>
        </li>
      </ul>
    </nav>
  )
}
