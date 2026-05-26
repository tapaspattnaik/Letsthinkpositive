'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { LtpLogo } from '@/components/ui/LtpLogo'

interface NavItem  { href: string; label: string; desc?: string; icon?: string }
interface NavGroup { label: string; icon: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Read',
    icon: '📖',
    items: [
      { href: '/blog',      label: 'Blog',       desc: 'Stories & insights',       icon: '✍️' },
      { href: '/library',   label: 'Library',    desc: 'Wellness articles',        icon: '📚' },
      { href: '/feed',      label: 'Daily Feed', desc: 'Quotes & inspiration',     icon: '✨' },
    ],
  },
  {
    label: 'Tools',
    icon: '🛠️',
    items: [
      { href: '/journal',      label: 'Journal',       desc: 'Gratitude journaling',    icon: '📓' },
      { href: '/coach',        label: 'Calm Coach',    desc: 'AI wellness guide',       icon: '🌿' },
      { href: '/advisor',      label: 'Bit Advisor',   desc: 'AI companion',            icon: '🤖' },
      { href: '/meditation',   label: 'Meditation',    desc: 'Guided sessions',         icon: '🧘' },
      { href: '/sounds',       label: 'Calm Sounds',   desc: 'Ambient sound mixer',     icon: '🎧' },
      { href: '/challenges',   label: 'Challenges',    desc: '30-day programmes',       icon: '🏆' },
      { href: '/vision-board', label: 'Vision Board',  desc: 'Visualise your goals',    icon: '⭐' },
      { href: '/kids',         label: 'Kids Zone',     desc: 'For little learners',     icon: '🌈' },
    ],
  },
  {
    label: 'Community',
    icon: '💛',
    items: [
      { href: '/community', label: 'Community', desc: 'Stories & sharing',        icon: '💬' },
      { href: '/about',     label: 'About',     desc: 'Our mission & story',      icon: '🌱' },
    ],
  },
]

const FLAT_LINKS: NavItem[] = [{ href: '/', label: 'Home' }]

export function Navbar() {
  const pathname    = usePathname()
  const [open, setOpen]         = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [mobileGroup, setMobileGroup] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => { setOpen(false); setOpenGroup(null) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isGroupActive = (group: NavGroup) => group.items.some(i => pathname === i.href || pathname.startsWith(i.href + '/'))

  return (
    <>
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-ivory/96 backdrop-blur-md border-b border-teal-light h-[72px] flex items-center justify-between px-[5%]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline hover:opacity-85 transition-opacity flex-shrink-0">
          <LtpLogo size={44} />
          <span className="font-body text-[1.1rem] leading-none hidden sm:block">
            <span className="text-teal-mid font-light">lets</span>
            <span className="text-teal-deep font-bold">think</span>
            <span className="text-amber font-light">positive</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1 list-none">
          {/* Home */}
          <li>
            <Link href="/"
              className={`px-3 py-2 rounded-lg text-[0.87rem] font-medium no-underline transition-colors
                ${pathname === '/' ? 'text-teal-deep bg-teal-ghost' : 'text-text-mid hover:text-teal-deep hover:bg-teal-ghost'}`}>
              Home
            </Link>
          </li>

          {/* Dropdown groups */}
          {NAV_GROUPS.map(group => (
            <li key={group.label} className="relative">
              <button
                onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.87rem] font-medium transition-colors
                  ${isGroupActive(group) ? 'text-teal-deep bg-teal-ghost' : 'text-text-mid hover:text-teal-deep hover:bg-teal-ghost'}`}>
                {group.label}
                <span className={`text-[0.6rem] transition-transform duration-200 ${openGroup === group.label ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {openGroup === group.label && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[280px] bg-white border border-teal-light rounded-[20px] shadow-lift p-2 z-50">
                  {group.items.map(item => (
                    <Link key={item.href} href={item.href}
                      onClick={() => setOpenGroup(null)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-[14px] no-underline transition-all group
                        ${pathname === item.href || pathname.startsWith(item.href + '/')
                          ? 'bg-teal-ghost text-teal-deep'
                          : 'text-text-mid hover:bg-teal-ghost hover:text-teal-deep'}`}>
                      <span className="text-[1.3rem] flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-[0.88rem] leading-none mb-0.5">{item.label}</p>
                        {item.desc && <p className="text-[0.75rem] text-text-xlight group-hover:text-teal-mid transition-colors">{item.desc}</p>}
                      </div>
                      {(pathname === item.href || pathname.startsWith(item.href + '/')) && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}

          <li>
            <Link href="/contact"
              className="ml-2 bg-teal-deep text-white text-[0.82rem] font-medium px-4 py-2 rounded-full no-underline hover:bg-teal-dark transition-colors">
              Contact Us
            </Link>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] rounded-lg hover:bg-teal-ghost transition-colors">
          <span className={`block w-6 h-0.5 bg-teal-deep rounded transition-all duration-300 ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-6 h-0.5 bg-teal-deep rounded transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-teal-deep rounded transition-all duration-300 ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        />

        <div className={`absolute top-[72px] left-0 right-0 bg-ivory border-b border-teal-light shadow-lift transition-transform duration-300 max-h-[calc(100vh-72px)] overflow-y-auto ${open ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="px-[5%] py-3">
            {/* Home */}
            <Link href="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-card text-[0.97rem] font-medium no-underline transition-all mb-1
                ${pathname === '/' ? 'bg-teal-ghost text-teal-deep' : 'text-text-mid hover:bg-teal-ghost hover:text-teal-deep'}`}>
              🏠 Home
              {pathname === '/' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber" />}
            </Link>

            {/* Groups */}
            {NAV_GROUPS.map(group => (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => setMobileGroup(mobileGroup === group.label ? null : group.label)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-card text-[0.97rem] font-semibold transition-all
                    ${isGroupActive(group) ? 'text-teal-deep' : 'text-text-mid'}`}>
                  <span>{group.icon} {group.label}</span>
                  <span className={`text-[0.65rem] transition-transform ${mobileGroup === group.label ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {mobileGroup === group.label && (
                  <div className="pl-4 pb-2 flex flex-col gap-0.5">
                    {group.items.map(item => (
                      <Link key={item.href} href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-[14px] text-[0.9rem] no-underline transition-all
                          ${pathname === item.href || pathname.startsWith(item.href + '/')
                            ? 'bg-teal-ghost text-teal-deep font-medium'
                            : 'text-text-mid hover:bg-teal-ghost hover:text-teal-deep'}`}>
                        <span className="text-[1.1rem]">{item.icon}</span>
                        <span>{item.label}</span>
                        {(pathname === item.href || pathname.startsWith(item.href + '/')) && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber" />
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-[5%] pb-5 pt-2 border-t border-teal-light">
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
