'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN ?? '1234'

const PAGES = [
  { id: 'home',         label: 'Home Page',        icon: '🏠' },
  { id: 'library',      label: 'Library',           icon: '📚' },
  { id: 'blog',         label: 'Blog',              icon: '✍️' },
  { id: 'challenges',   label: 'Challenges',        icon: '🏆' },
  { id: 'meditation',   label: 'Meditation',        icon: '🧘' },
  { id: 'feed',         label: 'Daily Feed',        icon: '📰' },
  { id: 'community',    label: 'Community',         icon: '💬' },
  { id: 'coach',        label: 'Calm Coach',        icon: '🌿' },
  { id: 'kids',         label: 'Kids Zone',         icon: '🌈' },
  { id: 'vision-board', label: 'Vision Board',      icon: '⭐' },
  { id: 'journal',      label: 'Gratitude Journal', icon: '📓' },
  { id: 'sounds',       label: 'Calm Sounds',       icon: '🎧' },
  { id: 'advisor',      label: 'Bit Advisor',       icon: '✨' },
]

const HERO_FIELDS = ['title', 'subtitle', 'cta_primary', 'cta_secondary']

interface Settings {
  enabledPages:    Record<string, boolean>
  announcement:    string
  announcementOn:  boolean
  featuredArticle: string
  featuredChallenge: string
  heroOverrides:   Record<string, string>
  publishDate:     string
}

const DEFAULT_SETTINGS: Settings = {
  enabledPages:     Object.fromEntries(PAGES.map(p => [p.id, true])),
  announcement:     'New! Guided Sleep Stories — Drift off to a tranquil night\'s sleep with our latest audio collection.',
  announcementOn:   true,
  featuredArticle:  '5-minute-morning-mindfulness-meditation',
  featuredChallenge:'gratitude-30',
  heroOverrides:    {},
  publishDate:      '',
}

export default function AdminPage() {
  const [pin, setPin]         = useState('')
  const [authed, setAuthed]   = useState(false)
  const [pinError, setPinError] = useState(false)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [saved, setSaved]     = useState(false)
  const [activeTab, setActiveTab] = useState<'pages' | 'content' | 'hero'>('pages')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ltp_admin_settings')
      if (stored) setSettings(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  function checkPin() {
    if (pin === ADMIN_PIN) { setAuthed(true); setPinError(false) }
    else { setPinError(true); setPin('') }
  }

  function save() {
    localStorage.setItem('ltp_admin_settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function togglePage(id: string) {
    setSettings(s => ({ ...s, enabledPages: { ...s.enabledPages, [id]: !s.enabledPages[id] } }))
  }

  if (!authed) {
    return (
      <section className="min-h-screen bg-ivory flex items-center justify-center px-[5%]">
        <div className="w-full max-w-sm bg-white border border-teal-light rounded-[28px] p-10 text-center shadow-lift">
          <div className="text-[3rem] mb-4">🔐</div>
          <h1 className="font-display text-[1.5rem] text-charcoal font-semibold mb-2">Admin Access</h1>
          <p className="text-text-light text-[0.88rem] mb-6">Enter your admin PIN to continue.</p>
          <input
            type="password" value={pin} onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkPin()}
            placeholder="Enter PIN"
            className="w-full px-4 py-3 bg-ivory border border-teal-light rounded-[14px] text-center text-[1.1rem] tracking-[0.3em] outline-none focus:border-teal-mid transition-colors mb-3" />
          {pinError && <p className="text-red-500 text-[0.82rem] mb-3">Incorrect PIN. Please try again.</p>}
          <button onClick={checkPin}
            className="w-full bg-teal-deep text-white py-3 rounded-full font-semibold hover:bg-teal-dark transition-colors">
            Enter
          </button>
          <p className="text-text-xlight text-[0.72rem] mt-4">Set PIN via NEXT_PUBLIC_ADMIN_PIN in .env (default: 1234)</p>
        </div>
      </section>
    )
  }

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-14 px-[5%] text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-2">Admin Panel</div>
            <h1 className="font-display text-[2rem] font-bold">Site Settings</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={save}
              className={`px-6 py-2.5 rounded-full font-semibold text-[0.9rem] transition-all ${
                saved ? 'bg-green-500 text-white' : 'bg-amber text-charcoal hover:bg-amber-soft'
              }`}>
              {saved ? '✓ Saved' : 'Save Changes'}
            </button>
            <button onClick={() => setAuthed(false)}
              className="px-6 py-2.5 rounded-full border border-white/30 text-white text-[0.9rem] hover:bg-white/10 transition-colors">
              Log Out
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-10 px-[5%]">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-teal-light pb-4">
          {(['pages', 'content', 'hero'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-[0.88rem] font-medium capitalize transition-all ${
                activeTab === tab ? 'bg-teal-deep text-white' : 'text-text-mid hover:bg-teal-ghost'
              }`}>
              {tab === 'pages' ? '📄 Pages' : tab === 'content' ? '📝 Content' : '🖼️ Hero'}
            </button>
          ))}
        </div>

        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div>
            <h2 className="font-display text-[1.15rem] text-charcoal font-semibold mb-2">Page Visibility</h2>
            <p className="text-text-light text-[0.88rem] mb-6">Toggle sections on or off. Changes are stored locally for reference.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PAGES.map(page => (
                <div key={page.id}
                  className={`flex items-center justify-between p-5 rounded-[18px] border transition-all ${
                    settings.enabledPages[page.id] ? 'bg-white border-teal-light' : 'bg-ivory border-teal-light/50 opacity-60'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-[1.5rem]">{page.icon}</span>
                    <div>
                      <p className="font-medium text-[0.92rem] text-charcoal">{page.label}</p>
                      <Link href={`/${page.id === 'home' ? '' : page.id}`} target="_blank"
                        className="text-[0.72rem] text-teal-mid hover:underline">
                        /{page.id === 'home' ? '' : page.id}
                      </Link>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePage(page.id)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      settings.enabledPages[page.id] ? 'bg-teal-mid' : 'bg-gray-200'
                    }`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      settings.enabledPages[page.id] ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-8">
            {/* Announcement */}
            <div className="bg-white border border-teal-light rounded-[24px] p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-[1.1rem] text-charcoal font-semibold">📢 Site Announcement</h3>
                <button
                  onClick={() => setSettings(s => ({ ...s, announcementOn: !s.announcementOn }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${settings.announcementOn ? 'bg-teal-mid' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.announcementOn ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <textarea rows={3} value={settings.announcement}
                onChange={e => setSettings(s => ({ ...s, announcement: e.target.value }))}
                className="w-full px-4 py-3 bg-ivory border border-teal-light rounded-[14px] text-[0.9rem] outline-none focus:border-teal-mid transition-colors resize-none" />
            </div>

            {/* Featured selections */}
            <div className="bg-white border border-teal-light rounded-[24px] p-8">
              <h3 className="font-display text-[1.1rem] text-charcoal font-semibold mb-5">⭐ Featured Items</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Featured Library Article (slug)</label>
                  <input value={settings.featuredArticle}
                    onChange={e => setSettings(s => ({ ...s, featuredArticle: e.target.value }))}
                    placeholder="article-slug"
                    className="w-full px-4 py-3 bg-ivory border border-teal-light rounded-[14px] text-[0.88rem] outline-none focus:border-teal-mid transition-colors" />
                </div>
                <div>
                  <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Featured Challenge (id)</label>
                  <input value={settings.featuredChallenge}
                    onChange={e => setSettings(s => ({ ...s, featuredChallenge: e.target.value }))}
                    placeholder="challenge-id"
                    className="w-full px-4 py-3 bg-ivory border border-teal-light rounded-[14px] text-[0.88rem] outline-none focus:border-teal-mid transition-colors" />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white border border-teal-light rounded-[24px] p-8">
              <h3 className="font-display text-[1.1rem] text-charcoal font-semibold mb-4">📅 Content Scheduling</h3>
              <p className="text-text-light text-[0.85rem] mb-4">Set a publish date for upcoming content releases.</p>
              <div>
                <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Next scheduled publish</label>
                <input type="datetime-local" value={settings.publishDate}
                  onChange={e => setSettings(s => ({ ...s, publishDate: e.target.value }))}
                  className="px-4 py-3 bg-ivory border border-teal-light rounded-[14px] text-[0.88rem] outline-none focus:border-teal-mid transition-colors" />
              </div>
            </div>
          </div>
        )}

        {/* Hero Tab */}
        {activeTab === 'hero' && (
          <div>
            <h2 className="font-display text-[1.15rem] text-charcoal font-semibold mb-2">Hero Text Overrides</h2>
            <p className="text-text-light text-[0.88rem] mb-6">Override default hero text for any page. Leave blank to use the page default.</p>
            <div className="space-y-6">
              {PAGES.slice(0, 6).map(page => (
                <div key={page.id} className="bg-white border border-teal-light rounded-[20px] p-6">
                  <h3 className="font-medium text-charcoal mb-4">{page.icon} {page.label}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {HERO_FIELDS.map(field => (
                      <div key={field}>
                        <label className="block text-[0.78rem] text-text-xlight mb-1 capitalize">{field.replace('_', ' ')}</label>
                        <input
                          value={settings.heroOverrides[`${page.id}_${field}`] ?? ''}
                          onChange={e => setSettings(s => ({
                            ...s,
                            heroOverrides: { ...s.heroOverrides, [`${page.id}_${field}`]: e.target.value }
                          }))}
                          placeholder={`Default ${field.replace('_', ' ')}`}
                          className="w-full px-3 py-2 bg-ivory border border-teal-light rounded-[10px] text-[0.85rem] outline-none focus:border-teal-mid transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save bar */}
        <div className="mt-10 flex justify-end">
          <button onClick={save}
            className={`px-8 py-3.5 rounded-full font-semibold text-[0.95rem] transition-all ${
              saved ? 'bg-green-500 text-white' : 'bg-teal-deep text-white hover:bg-teal-dark'
            }`}>
            {saved ? '✓ Changes Saved' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </>
  )
}
