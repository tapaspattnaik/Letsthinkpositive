'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { LtpLogo } from '@/components/ui/LtpLogo'
import { NotificationBell } from '@/components/NotificationBell'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface NavItem     { href: string; label: string; desc?: string; icon?: string }
interface NavSubGroup { label: string; items: NavItem[] }
interface NavGroup    { label: string; icon: string; items?: NavItem[]; subGroups?: NavSubGroup[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Read',
    icon: '📖',
    items: [
      { href: '/blog',      label: 'Blog',       desc: 'Stories & insights',        icon: '✍️' },
      { href: '/good-news', label: 'Good News',  desc: 'Uplifting stories globally', icon: '🌍' },
      { href: '/library',   label: 'Library',    desc: 'Wellness articles',          icon: '📚' },
      { href: '/feed',      label: 'Daily Feed', desc: 'Quotes & inspiration',       icon: '✨' },
    ],
  },
  {
    label: 'Tools',
    icon: '🛠️',
    subGroups: [
      {
        label: '🪞 Reflect',
        items: [
          { href: '/journal',    label: 'Journal',           desc: 'Gratitude journaling',       icon: '📓' },
          { href: '/mood',       label: 'Mood Tracker',      desc: 'Log & chart your mood',      icon: '📊' },
          { href: '/sleep',      label: 'Sleep Tracker',     desc: 'Track & improve your sleep', icon: '🌙' },
          { href: '/water',      label: 'Water Tracker',     desc: 'Daily hydration goals',      icon: '💧' },
          { href: '/calendar',   label: 'Wellness Calendar', desc: 'Your journey, day by day',   icon: '📅' },
          { href: '/snapshot',   label: 'Wellness Snapshot', desc: 'Your 7-day summary',         icon: '📈' },
          { href: '/intention',  label: 'Morning Intention', desc: 'Set your daily focus',       icon: '🌅' },
        ],
      },
      {
        label: '🧘 Calm',
        items: [
          { href: '/coach',      label: 'Calm Coach',        desc: 'AI wellness guide',          icon: '🌿' },
          { href: '/meditation', label: 'Meditation',        desc: 'Guided sessions',            icon: '🧘' },
          { href: '/sounds',     label: 'Calm Sounds',       desc: 'Ambient sound mixer',        icon: '🎧' },
          { href: '/breathing',  label: 'Breathing',         desc: 'Guided exercises',           icon: '🌬️' },
        ],
      },
      {
        label: '💪 Grow',
        items: [
          { href: '/challenges',    label: 'Challenges',       desc: '30-day programmes',         icon: '🏆' },
          { href: '/habits',        label: 'Habit Tracker',    desc: 'Build daily habits',        icon: '🎯' },
          { href: '/habits-lab',    label: 'Habits Lab',       desc: 'Habit science & stacking',  icon: '⚡' },
          { href: '/yoga',          label: 'Yoga Guide',       desc: 'Types, steps & benefits',   icon: '🧘‍♀️' },
          { href: '/reframe',       label: 'Thought Reframer', desc: 'CBT-based reframing',       icon: '🧠' },
          { href: '/wisdom-coaching', label: 'Wisdom Coaching', desc: 'Life guidance & purpose',  icon: '👴' },
        ],
      },
      {
        label: '🎨 Create',
        items: [
          { href: '/affirmation',  label: 'Daily Affirmation', desc: 'Generate a card',           icon: '💌' },
          { href: '/quotes',       label: 'Quote Creator',     desc: 'Shareable quote card',      icon: '🎨' },
          { href: '/vision-board', label: 'Vision Board',      desc: 'Visualise your goals',      icon: '⭐' },
          { href: '/drawing',      label: 'Positive Drawing',  desc: 'Zentangle & mandala',       icon: '✏️' },
        ],
      },
      {
        label: '🌿 Wellbeing',
        items: [
          { href: '/positive-eating', label: 'Positive Eating',    desc: 'Food, mood & nutrition',    icon: '🥗' },
          { href: '/happy-foods',     label: 'Foods for Happiness', desc: 'Eat your way to joy',       icon: '😊' },
          { href: '/kids',            label: 'Kids Zone',           desc: 'For little learners',       icon: '🌈' },
        ],
      },
    ],
  },
  {
    label: 'Community',
    icon: '💛',
    items: [
      { href: '/quiz',              label: 'Wellness Quiz',  desc: 'Get your personal plan',         icon: '🎯' },
      { href: '/tribe',             label: 'My Tribe',       desc: 'Your connections & feed',        icon: '🌿' },
      { href: '/community',         label: 'Community',      desc: 'Stories & sharing',              icon: '💬' },
      { href: '/community/gallery', label: 'Gallery',       desc: 'Good deeds & activities',        icon: '📸' },
      { href: '/circles',           label: 'Circles',       desc: 'Private group spaces',           icon: '🔒' },
      { href: '/gratitude-wall',    label: 'Gratitude Wall',desc: "Share what you're grateful for", icon: '🙏' },
      { href: '/kindness-map',      label: 'Kindness Map',  desc: 'See kindness spread worldwide',  icon: '🗺️' },
      { href: '/about',             label: 'About',         desc: 'Our mission & story',            icon: '🌱' },
    ],
  },
]

export function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { data: session } = useSession()

  // Desktop dropdown
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const closeTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navRef      = useRef<HTMLElement>(null)

  // Mobile drawer
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [mobileGroup, setMobileGroup] = useState<string | null>(null)

  // Search
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ,    setSearchQ]    = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // ── Close everything on route change ───────────────────────
  useEffect(() => {
    setDrawerOpen(false)
    setOpenGroup(null)
    setSearchOpen(false)
  }, [pathname])

  // ── Lock body scroll when drawer open ──────────────────────
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  // ── Focus search input when search opens ───────────────────
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 60)
  }, [searchOpen])

  // ── Global Escape key ──────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setSearchOpen(false); setDrawerOpen(false) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // ── Close dropdown on outside click ────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function openDropdown(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenGroup(label)
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpenGroup(null), 150)
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQ.trim().length < 2) return
    router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`)
    setSearchOpen(false)
    setSearchQ('')
  }

  const isGroupActive = (group: NavGroup) => {
    const allItems = group.items ?? group.subGroups?.flatMap(sg => sg.items) ?? []
    return allItems.some(i => pathname === i.href || pathname.startsWith(i.href + '/'))
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          TOP BAR
      ═══════════════════════════════════════════════════════ */}
      <nav
        ref={navRef}
        className="relative z-auto bg-ivory border-b border-teal-light shadow-[0_1px_12px_rgba(26,107,107,0.08)] h-[72px] flex items-center justify-between px-4 sm:px-[5%]"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline hover:opacity-85 transition-opacity flex-shrink-0">
          <LtpLogo size={62} />
          <div className="flex flex-col leading-none">
            <span className="font-body text-[1.25rem] leading-tight tracking-tight">
              <span className="text-teal-mid font-light">lets</span>
              <span className="text-teal-deep font-bold">think</span>
              <span className="text-amber font-light">positive</span>
            </span>
          </div>
        </Link>

        {/* ── Desktop nav ─────────────────────────────────── */}
        <ul className="hidden lg:flex items-center gap-1 list-none">
          <li>
            <Link href="/"
              className={`px-3 py-2 rounded-lg text-[0.87rem] font-medium no-underline transition-colors
                ${pathname === '/' ? 'text-teal-deep bg-teal-ghost' : 'text-charcoal hover:text-teal-deep hover:bg-teal-ghost'}`}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/tools"
              className={`px-3 py-2 rounded-lg text-[0.87rem] font-medium no-underline transition-colors
                ${pathname === '/tools' ? 'text-teal-deep bg-teal-ghost' : 'text-charcoal hover:text-teal-deep hover:bg-teal-ghost'}`}>
              All Tools
            </Link>
          </li>

          {NAV_GROUPS.map(group => (
            <li key={group.label} className="relative"
              onMouseEnter={() => openDropdown(group.label)}
              onMouseLeave={scheduleClose}>
              <button
                aria-haspopup="menu"
                aria-expanded={openGroup === group.label}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.87rem] font-medium transition-colors
                  ${isGroupActive(group) || openGroup === group.label
                    ? 'text-teal-deep bg-teal-ghost'
                    : 'text-charcoal hover:text-teal-deep hover:bg-teal-ghost'}`}>
                {group.label}
                <span className={`text-[0.6rem] transition-transform duration-200 ${openGroup === group.label ? 'rotate-180' : ''}`} aria-hidden="true">▼</span>
              </button>

              <div
                role="menu"
                aria-label={`${group.label} menu`}
                onMouseEnter={() => openDropdown(group.label)}
                onMouseLeave={scheduleClose}
                className={`absolute top-full z-50 transition-all duration-200 origin-top
                  ${group.subGroups ? 'left-1/2 -translate-x-1/2 w-[680px]' : 'left-1/2 -translate-x-1/2 w-[280px]'}
                  ${openGroup === group.label
                    ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-y-95 -translate-y-1 pointer-events-none'}`}>
                <div className="pt-2">
                  <div className="bg-white border border-teal-light rounded-[20px] shadow-lift p-3">
                    {group.subGroups ? (
                      /* ── Sub-grouped layout (Tools) ── */
                      <div className="grid grid-cols-3 gap-3">
                        {group.subGroups.map(sg => (
                          <div key={sg.label}>
                            <p className="text-[0.68rem] font-bold text-text-xlight uppercase tracking-widest px-2 pb-1.5 pt-0.5">{sg.label}</p>
                            {sg.items.map(item => (
                              <Link key={item.href} href={item.href}
                                onClick={() => setOpenGroup(null)}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] no-underline transition-all group
                                  ${pathname === item.href || pathname.startsWith(item.href + '/')
                                    ? 'bg-teal-ghost text-teal-deep'
                                    : 'text-charcoal hover:bg-teal-ghost hover:text-teal-deep'}`}>
                                <span className="text-[1.1rem] flex-shrink-0">{item.icon}</span>
                                <div className="min-w-0">
                                  <p className="font-semibold text-[0.82rem] leading-none mb-0.5 truncate">{item.label}</p>
                                  {item.desc && <p className="text-[0.7rem] text-text-xlight group-hover:text-teal-mid transition-colors truncate">{item.desc}</p>}
                                </div>
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* ── Flat layout (Read, Community) ── */
                      (group.items ?? []).map(item => (
                        <Link key={item.href} href={item.href}
                          onClick={() => setOpenGroup(null)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-[14px] no-underline transition-all group
                            ${pathname === item.href || pathname.startsWith(item.href + '/')
                              ? 'bg-teal-ghost text-teal-deep'
                              : 'text-charcoal hover:bg-teal-ghost hover:text-teal-deep'}`}>
                          <span className="text-[1.3rem] flex-shrink-0">{item.icon}</span>
                          <div>
                            <p className="font-semibold text-[0.88rem] leading-none mb-0.5">{item.label}</p>
                            {item.desc && <p className="text-[0.75rem] text-text-xlight group-hover:text-teal-mid transition-colors">{item.desc}</p>}
                          </div>
                          {(pathname === item.href || pathname.startsWith(item.href + '/')) && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" />
                          )}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}

          {/* Dark mode toggle */}
          <li><ThemeToggle /></li>

          {/* Search */}
          <li>
            <button
              onClick={() => setSearchOpen(s => !s)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-teal-ghost transition-colors text-charcoal"
              aria-label="Search">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>
          </li>

          <li>
            <Link href="/contact"
              className="ml-1 bg-teal-deep text-white text-[0.82rem] font-medium px-4 py-2 rounded-full no-underline hover:bg-teal-dark transition-colors">
              Contact Us
            </Link>
          </li>

          <li><NotificationBell /></li>

          <li>
            {session ? (
              /* Direct link to profile — no dropdown, instant navigation */
              <Link href="/profile"
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-teal-light hover:border-teal-mid hover:bg-teal-ghost/50 transition-all no-underline ml-1">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-teal-ghost flex items-center justify-center flex-shrink-0">
                  {session.user?.image
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    : <span className="text-[0.8rem]">🌿</span>}
                </div>
                <span className="text-[0.82rem] font-medium text-teal-deep max-w-[80px] truncate">
                  {session.user?.name?.split(' ')[0]}
                </span>
              </Link>
            ) : (
              <Link href="/login"
                className="ml-1 border border-teal-mid text-teal-deep text-[0.82rem] font-medium px-4 py-2 rounded-full no-underline hover:bg-teal-ghost transition-colors">
                Sign in
              </Link>
            )}
          </li>
        </ul>

        {/* ── Mobile right controls ────────────────────────── */}
        <div className="lg:hidden flex items-center gap-1">
          {/* Search icon on mobile */}
          <button
            onClick={() => setSearchOpen(s => !s)}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-teal-ghost transition-colors text-charcoal"
            aria-label="Search">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>

          <NotificationBell />

          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen(o => !o)}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
            className="w-11 h-11 flex flex-col justify-center items-center gap-[5px] rounded-lg hover:bg-teal-ghost transition-colors ml-0.5">
            <span className={`block w-6 h-[2.5px] bg-teal-deep rounded-full transition-all duration-300 origin-center ${drawerOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-6 h-[2.5px] bg-teal-deep rounded-full transition-all duration-300 ${drawerOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-6 h-[2.5px] bg-teal-deep rounded-full transition-all duration-300 origin-center ${drawerOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════
          SEARCH OVERLAY
      ═══════════════════════════════════════════════════════ */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-charcoal/40 backdrop-blur-sm flex items-start justify-center pt-[100px] px-4"
          onClick={e => { if (e.target === e.currentTarget) setSearchOpen(false) }}>
          <form onSubmit={submitSearch}
            className="w-full max-w-xl bg-white rounded-[20px] shadow-lift border border-teal-light flex items-center overflow-hidden">
            <svg className="w-5 h-5 text-text-xlight ml-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              ref={searchRef}
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search articles, stories, library…"
              className="flex-1 px-4 py-4 text-[0.95rem] outline-none bg-transparent"
            />
            <button type="button" onClick={() => setSearchOpen(false)}
              className="px-4 py-4 text-text-xlight hover:text-charcoal text-[1.3rem] leading-none">
              ×
            </button>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MOBILE DRAWER — slides in from the right
      ═══════════════════════════════════════════════════════ */}
      <div
        className="lg:hidden"
        aria-hidden={!drawerOpen}
      >
        {/* Backdrop */}
        <div
          onClick={() => setDrawerOpen(false)}
          className={`fixed inset-0 z-[45] bg-charcoal/50 transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        />

        {/* Drawer panel — slides from right */}
        <div
          className={`fixed top-0 right-0 bottom-0 z-[46] w-[88vw] max-w-[340px] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-teal-light/60 bg-gradient-to-r from-teal-deep to-teal-dark flex-shrink-0 h-[72px]">
            <Link href="/" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2.5 no-underline">
              <div className="bg-white/15 rounded-full p-1">
                <LtpLogo size={40} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-body text-[1rem] leading-tight">
                  <span className="text-teal-light font-light">lets</span>
                  <span className="text-white font-bold">think</span>
                  <span className="text-amber font-light">positive</span>
                </span>
                {session && (
                  <span className="text-white/55 text-[0.68rem] mt-0.5 truncate max-w-[160px]">
                    Hi, {session.user?.name?.split(' ')[0]} 👋
                  </span>
                )}
              </div>
            </Link>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors text-[1.1rem]">
              ✕
            </button>
          </div>

          {/* Scrollable nav content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <nav className="px-3 pt-3 pb-2">

              {/* Home */}
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 rounded-[16px] text-[0.95rem] font-semibold no-underline transition-all mb-1
                  ${pathname === '/' ? 'bg-teal-ghost text-teal-deep' : 'text-charcoal hover:bg-teal-ghost/60 hover:text-teal-deep'}`}>
                <span className="text-[1.3rem] w-8 text-center flex-shrink-0">🏠</span>
                Home
                {pathname === '/' && <span className="ml-auto w-2 h-2 rounded-full bg-amber" />}
              </Link>

              {/* Group accordions */}
              {NAV_GROUPS.map(group => {
                const isActive   = isGroupActive(group)
                const isExpanded = mobileGroup === group.label
                return (
                  <div key={group.label} className="mb-1">
                    <button
                      onClick={() => setMobileGroup(isExpanded ? null : group.label)}
                      aria-expanded={isExpanded}
                      className={`w-full flex items-center gap-3 px-4 py-4 rounded-[16px] text-[0.95rem] font-semibold transition-all
                        ${isActive ? 'text-teal-deep' : 'text-charcoal hover:bg-teal-ghost/60 hover:text-teal-deep'}`}>
                      <span className="text-[1.3rem] w-8 text-center flex-shrink-0">{group.icon}</span>
                      <span className="flex-1 text-left">{group.label}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-amber flex-shrink-0" />}
                      <span className={`text-[0.65rem] text-text-xlight transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {/* Subitems */}
                    {isExpanded && (
                      <div className="ml-5 pl-3 border-l-2 border-teal-light mt-0.5 mb-1.5 flex flex-col gap-0.5">
                        {group.subGroups
                          ? group.subGroups.map(sg => (
                            <div key={sg.label}>
                              <p className="text-[0.65rem] font-bold text-text-xlight uppercase tracking-widest px-4 py-2">{sg.label}</p>
                              {sg.items.map(item => {
                                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                                return (
                                  <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-[14px] text-[0.88rem] no-underline transition-all
                                      ${active ? 'bg-teal-ghost text-teal-deep font-semibold' : 'text-charcoal hover:bg-teal-ghost/70 hover:text-teal-deep'}`}>
                                    <span className="text-[1.1rem] w-7 text-center flex-shrink-0">{item.icon}</span>
                                    <span className="flex-1">{item.label}</span>
                                    {active && <span className="w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" />}
                                  </Link>
                                )
                              })}
                            </div>
                          ))
                          : (group.items ?? []).map(item => {
                            const active = pathname === item.href || pathname.startsWith(item.href + '/')
                            return (
                              <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-[14px] text-[0.9rem] no-underline transition-all
                                  ${active ? 'bg-teal-ghost text-teal-deep font-semibold' : 'text-charcoal hover:bg-teal-ghost/70 hover:text-teal-deep'}`}>
                                <span className="text-[1.15rem] w-7 text-center flex-shrink-0">{item.icon}</span>
                                <span className="flex-1">{item.label}</span>
                                {active && <span className="w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" />}
                              </Link>
                            )
                          })
                        }
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Contact */}
              <Link
                href="/contact"
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 rounded-[16px] text-[0.95rem] font-semibold no-underline transition-all mt-1
                  ${pathname === '/contact' ? 'bg-teal-ghost text-teal-deep' : 'text-charcoal hover:bg-teal-ghost/60 hover:text-teal-deep'}`}>
                <span className="text-[1.3rem] w-8 text-center flex-shrink-0">✉️</span>
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Drawer footer — auth */}
          <div className="flex-shrink-0 border-t border-teal-light px-4 py-4 bg-ivory space-y-2.5">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[0.78rem] text-text-xlight font-medium">Appearance</span>
              <ThemeToggle />
            </div>
            {session ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 bg-teal-ghost rounded-[16px] no-underline hover:bg-teal-light/30 transition-colors">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-white flex items-center justify-center flex-shrink-0 border border-teal-light">
                    {session.user?.image
                      ? <Image src={session.user.image} alt="avatar" width={36} height={36} className="object-cover" />
                      : <span className="text-[1rem]">🌿</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.88rem] font-semibold text-teal-deep truncate">{session.user?.name}</p>
                    <p className="text-[0.72rem] text-text-xlight truncate">{session.user?.email}</p>
                  </div>
                  <span className="text-text-xlight text-[0.8rem]">›</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-400 py-3 rounded-full text-[0.88rem] font-semibold hover:bg-red-50 transition-colors">
                  🚪 Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="block w-full text-center bg-teal-deep text-white py-3.5 rounded-full font-semibold text-[0.95rem] no-underline hover:bg-teal-dark transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setDrawerOpen(false)}
                  className="block w-full text-center border border-teal-mid text-teal-deep py-3 rounded-full font-semibold text-[0.88rem] no-underline hover:bg-teal-ghost transition-colors">
                  Create free account →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
