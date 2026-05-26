'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LtpLogo } from '@/components/ui/LtpLogo'

const links = [
  { href: '/',        label: 'Home'        },
  { href: '/about',   label: 'About'       },
  { href: '/blog',    label: 'Blog'        },
  { href: '/journal', label: 'Journal'     },
  { href: '/sounds',  label: 'Calm'        },
  { href: '/advisor', label: 'Bit Advisor' },
  { href: '/contact', label: 'Contact'     },
]

export function Navbar() {
  const pathname  = usePathname()
  const [open, setOpen] = useState(false)

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-ivory/95 backdrop-blur-md border-b border-teal-light h-[72px] flex items-center justify-between px-[5%]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline hover:opacity-85 transition-opacity">
          <LtpLogo size={44} />
          <span className="font-body text-[1.1rem] leading-none">
            <span className="text-teal-mid font-light">lets</span>
            <span className="text-teal-deep font-bold">think</span>
            <span className="text-amber font-light">positive</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-7 list-none">
          {links.slice(0, -1).map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={`text-[0.88rem] font-medium tracking-wide no-underline transition-colors relative
                after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5
                after:bg-amber after:rounded-sm after:scale-x-0 after:transition-transform after:origin-left
                hover:text-teal-deep hover:after:scale-x-100
                ${pathname === href ? 'text-teal-deep after:scale-x-100' : 'text-text-mid'}`}>
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/contact"
              className="bg-teal-deep text-white text-[0.82rem] font-medium px-4 py-2 rounded-full no-underline hover:bg-teal-dark transition-colors">
              Contact Us
            </Link>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] rounded-lg hover:bg-teal-ghost transition-colors">
          <span className={`block w-6 h-0.5 bg-teal-deep rounded transition-all duration-300 ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-6 h-0.5 bg-teal-deep rounded transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-teal-deep rounded transition-all duration-300 ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Drawer panel */}
        <div className={`absolute top-[72px] left-0 right-0 bg-ivory border-b border-teal-light shadow-lift transition-transform duration-300 ${open ? 'translate-y-0' : '-translate-y-full'}`}>
          <ul className="list-none px-[5%] py-4 flex flex-col gap-1">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link href={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-card text-[1rem] font-medium no-underline transition-all
                    ${pathname === href
                      ? 'bg-teal-ghost text-teal-deep'
                      : 'text-text-mid hover:bg-teal-ghost hover:text-teal-deep'}`}>
                  {label}
                  {pathname === href && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber" />}
                </Link>
              </li>
            ))}
          </ul>

          <div className="px-[5%] pb-5">
            <Link href="/contact" onClick={() => setOpen(false)}
              className="block w-full text-center bg-teal-deep text-white py-3 rounded-full font-semibold text-[0.95rem] no-underline hover:bg-teal-dark transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
