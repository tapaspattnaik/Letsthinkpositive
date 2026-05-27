'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const subjects = [
  'A story to share, a question, just saying hi...',
  'I want to submit a blog post',
  'I\'m interested in coaching',
  'I want to be a community coach (elderly coaches)',
  'General question or feedback',
  'Just saying hello 👋',
]

const socials = [
  { icon: '📧', label: 'hello@letsthinkpositive.com', href: 'mailto:hello@letsthinkpositive.com' },
  { icon: '▶️', label: 'YouTube — letsthinkpositive',   href: '#' },
  { icon: '📷', label: 'Instagram — @letsthinkpositive', href: 'https://www.instagram.com/letsthinkpositive' },
  { icon: '💼', label: 'LinkedIn — Tapas Pattanaik',    href: 'https://www.linkedin.com/in/tapaspattnaik' },
  { icon: '📘', label: 'Facebook — letsthinkpositive',  href: 'https://www.facebook.com/letsthinkpositive' },
]

interface FbPost { id: string; message?: string; story?: string; full_picture?: string; created_time: string; permalink_url: string }
interface IgPost  { id: string; caption?: string; media_url: string; thumbnail_url?: string; media_type: string; timestamp: string; permalink: string }

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d  < 7)  return `${d} days ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function SocialFeed() {
  const [fb,         setFb]         = useState<FbPost[]>([])
  const [ig,         setIg]         = useState<IgPost[]>([])
  const [configured, setConfigured] = useState(true)
  const [loading,    setLoading]    = useState(true)
  const [tab,        setTab]        = useState<'ig' | 'fb'>('ig')

  useEffect(() => {
    fetch('/api/social')
      .then(r => r.json())
      .then(d => { setFb(d.fb ?? []); setIg(d.ig ?? []); setConfigured(d.configured ?? false) })
      .finally(() => setLoading(false))
  }, [])

  if (!configured) {
    return (
      <div className="bg-gradient-to-br from-teal-ghost to-white border border-teal-light rounded-[24px] p-8 text-center">
        <p className="text-[2rem] mb-3">📱</p>
        <h3 className="font-display text-[1.1rem] font-bold text-charcoal mb-2">Follow us on social media</h3>
        <p className="text-text-mid text-[0.87rem] mb-5">Stay connected for daily positivity, tips, and community stories.</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <a href="https://www.instagram.com/letsthinkpositive" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-full font-semibold text-[0.85rem] no-underline hover:opacity-90 transition-opacity">
            📷 Instagram
          </a>
          <a href="https://www.facebook.com/letsthinkpositive" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#1877F2] text-white px-5 py-2.5 rounded-full font-semibold text-[0.85rem] no-underline hover:opacity-90 transition-opacity">
            📘 Facebook
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-teal-light rounded-[24px] overflow-hidden shadow-card">
      {/* Tab switcher */}
      <div className="flex border-b border-teal-light">
        <button onClick={() => setTab('ig')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[0.85rem] font-semibold transition-colors
            ${tab === 'ig' ? 'text-teal-deep border-b-2 border-teal-deep bg-teal-ghost/30' : 'text-text-mid hover:text-teal-deep'}`}>
          📷 Instagram
        </button>
        <button onClick={() => setTab('fb')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[0.85rem] font-semibold transition-colors
            ${tab === 'fb' ? 'text-teal-deep border-b-2 border-teal-deep bg-teal-ghost/30' : 'text-text-mid hover:text-teal-deep'}`}>
          📘 Facebook
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-teal-ghost rounded-[12px] animate-pulse" />
            ))}
          </div>
        ) : tab === 'ig' ? (
          ig.length === 0 ? (
            <p className="text-center text-text-xlight py-8 text-[0.87rem]">No Instagram posts yet</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {ig.map(p => (
                <a key={p.id} href={p.permalink} target="_blank" rel="noopener noreferrer"
                  className="block aspect-square relative rounded-[12px] overflow-hidden group">
                  <Image
                    src={p.media_type === 'VIDEO' ? (p.thumbnail_url ?? p.media_url) : p.media_url}
                    alt={p.caption?.slice(0, 40) ?? 'Instagram post'}
                    fill className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2">
                    <span className="text-white text-[0.65rem] opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2 leading-tight">
                      {p.caption?.slice(0, 60)}
                    </span>
                  </div>
                  {p.media_type === 'VIDEO' && (
                    <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                      <span className="text-white text-[0.6rem]">▶</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          )
        ) : (
          fb.length === 0 ? (
            <p className="text-center text-text-xlight py-8 text-[0.87rem]">No Facebook posts yet</p>
          ) : (
            <div className="space-y-3">
              {fb.map(p => (
                <a key={p.id} href={p.permalink_url} target="_blank" rel="noopener noreferrer"
                  className="flex gap-3 p-3 rounded-[14px] hover:bg-teal-ghost transition-colors no-underline group">
                  {p.full_picture && (
                    <div className="w-14 h-14 rounded-[10px] overflow-hidden flex-shrink-0 relative">
                      <Image src={p.full_picture} alt="" fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.82rem] text-text-mid line-clamp-3 leading-[1.6] group-hover:text-charcoal transition-colors">
                      {p.message || p.story}
                    </p>
                    <p className="text-[0.7rem] text-text-xlight mt-1">{timeAgo(p.created_time)}</p>
                  </div>
                </a>
              ))}
            </div>
          )
        )}
      </div>

      <div className="border-t border-teal-light px-4 py-3 flex justify-between items-center">
        <span className="text-[0.73rem] text-text-xlight">Latest from our feed</span>
        <a href={tab === 'ig' ? 'https://www.instagram.com/letsthinkpositive' : 'https://www.facebook.com/letsthinkpositive'}
          target="_blank" rel="noopener noreferrer"
          className="text-[0.78rem] font-semibold text-teal-mid hover:text-teal-deep no-underline">
          See all →
        </a>
      </div>
    </div>
  )
}

export default function ContactPage() {
  const [status, setStatus] = useState<'idle'|'sending'|'done'|'error'>('idle')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-teal-ghost py-24 px-[5%]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-teal-mid text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4 section-label">
            We&apos;d Love to Hear From You
          </div>
          <h1 className="font-display text-[clamp(1.9rem,3vw,2.8rem)] text-charcoal leading-snug mb-3">
            The door is <em className="text-teal-deep italic">always open.</em> 🤝
          </h1>
          <p className="text-text-light text-[1.05rem] leading-[1.8] max-w-[540px]">
            There&apos;s a real person on the other side of this form. We read every message and reply to every one — personally, warmly, without a templated response.
          </p>
        </div>
      </section>

      {/* Main grid */}
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 py-16 px-[5%]">
        {/* Info + socials */}
        <div className="space-y-8">
          <blockquote className="border-l-[5px] border-amber bg-teal-ghost px-7 py-5 rounded-r-card">
            <p className="font-display italic text-[1.1rem] text-teal-deep leading-relaxed m-0">
              Remember — someone who listened to you is someone who cared. We care.
            </p>
          </blockquote>

          <div>
            <h3 className="font-display text-[1.3rem] text-teal-deep mb-2">Other ways to reach us</h3>
            <p className="text-[0.93rem] text-text-mid leading-[1.85] mb-4">
              We&apos;re active across these platforms. Pick the one that feels most natural to you.
            </p>
            <div className="flex flex-col gap-2.5">
              {socials.map(s => (
                <a key={s.label} href={s.href}
                  className="flex items-center gap-4 p-3.5 bg-white rounded-[16px] border border-teal-light no-underline text-text-mid hover:border-teal-mid hover:translate-x-1 transition-all">
                  <span className="text-[1.1rem]">{s.icon}</span>
                  <span className="text-[0.88rem] font-medium">{s.label}</span>
                </a>
              ))}
            </div>
            <p className="mt-4 text-[0.82rem] text-text-xlight">
              Response time: 24–48 hours for messages. Up to 5 working days for blog submissions.
            </p>
          </div>

          {/* Social feed */}
          <div>
            <h3 className="font-display text-[1.3rem] text-teal-deep mb-3">Latest from our social</h3>
            <SocialFeed />
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-[24px] p-10 shadow-lift self-start">
          <h3 className="font-display text-[1.5rem] text-teal-deep mb-6">Send us a message</h3>

          {status === 'done' ? (
            <div className="bg-teal-ghost rounded-card p-6 text-teal-deep font-medium text-center">
              🌱 Message received! We&apos;ll be in touch within 24–48 hours.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { label: 'Your name',          type: 'text',  key: 'name',    placeholder: 'What should we call you?' },
                { label: 'Your email address', type: 'email', key: 'email',   placeholder: "We'll reply here — promise" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[0.85rem] font-semibold text-teal-deep mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} required
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-4 py-3 border border-teal-light rounded-[14px] bg-ivory text-[0.92rem] text-charcoal outline-none focus:border-teal-mid transition-colors placeholder:text-text-xlight" />
                </div>
              ))}

              <div>
                <label className="block text-[0.85rem] font-semibold text-teal-deep mb-1.5">What&apos;s on your mind?</label>
                <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  className="w-full px-4 py-3 border border-teal-light rounded-[14px] bg-ivory text-[0.92rem] text-charcoal outline-none focus:border-teal-mid transition-colors">
                  {subjects.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[0.85rem] font-semibold text-teal-deep mb-1.5">Your message</label>
                <textarea rows={5} placeholder="Write freely — there's no wrong thing to say here" required
                  value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full px-4 py-3 border border-teal-light rounded-[14px] bg-ivory text-[0.92rem] text-charcoal outline-none focus:border-teal-mid transition-colors resize-vertical" />
              </div>

              {status === 'error' && <p className="text-red-500 text-[0.85rem]">Something went wrong — please try again or email us directly.</p>}

              <button type="submit" disabled={status === 'sending'}
                className="w-full bg-teal-deep text-white py-4 rounded-full font-semibold text-[1rem] hover:bg-teal-dark transition-colors disabled:opacity-60">
                {status === 'sending' ? 'Sending…' : 'Send it →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
