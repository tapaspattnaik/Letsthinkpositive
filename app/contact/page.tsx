'use client'

import type { Metadata } from 'next'
import { useState } from 'react'

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
  { icon: '▶️', label: 'YouTube — letsthinkpositive',  href: '#' },
  { icon: '📷', label: 'Instagram — @letsthinkpositive', href: '#' },
  { icon: '💼', label: 'LinkedIn — Tapas Pattanaik',   href: '#' },
]

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

      {/* Grid */}
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 py-16 px-[5%]">
        {/* Info */}
        <div>
          <blockquote className="border-l-[5px] border-amber bg-teal-ghost px-7 py-5 rounded-r-card mb-8">
            <p className="font-display italic text-[1.1rem] text-teal-deep leading-relaxed m-0">
              Remember — someone who listened to you is someone who cared. We care.
            </p>
          </blockquote>
          <h3 className="font-display text-[1.5rem] text-teal-deep mb-2">Other ways to reach us</h3>
          <p className="text-[0.97rem] text-text-mid leading-[1.85] mb-5">We&apos;re active across these platforms. Pick the one that feels most natural to you.</p>
          <div className="flex flex-col gap-3">
            {socials.map(s => (
              <a key={s.label} href={s.href}
                className="flex items-center gap-4 p-4 bg-white rounded-card border border-teal-light no-underline text-text-mid hover:border-teal-mid hover:translate-x-1 transition-all">
                <span className="text-[1.2rem]">{s.icon}</span>
                <span className="text-[0.9rem] font-medium">{s.label}</span>
              </a>
            ))}
          </div>
          <p className="mt-5 text-[0.84rem] text-text-xlight">Response time: 24–48 hours for messages. Up to 5 working days for blog submissions.</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-[24px] p-10 shadow-lift">
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
                  <label className="block text-[0.85rem] font-semibold text-teal-deep mb-1.5 tracking-wide">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} required
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-4 py-3 border border-teal-light rounded-card bg-ivory text-[0.92rem] text-charcoal outline-none focus:border-teal-mid focus:bg-white transition-colors placeholder:text-text-xlight" />
                </div>
              ))}

              <div>
                <label className="block text-[0.85rem] font-semibold text-teal-deep mb-1.5 tracking-wide">What&apos;s on your mind?</label>
                <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  className="w-full px-4 py-3 border border-teal-light rounded-card bg-ivory text-[0.92rem] text-charcoal outline-none focus:border-teal-mid transition-colors">
                  {subjects.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[0.85rem] font-semibold text-teal-deep mb-1.5 tracking-wide">Your message</label>
                <textarea rows={5} placeholder="Write freely — there's no wrong thing to say here" required
                  value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full px-4 py-3 border border-teal-light rounded-card bg-ivory text-[0.92rem] text-charcoal outline-none focus:border-teal-mid focus:bg-white transition-colors placeholder:text-text-xlight resize-vertical" />
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
