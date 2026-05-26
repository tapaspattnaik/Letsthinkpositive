'use client'

import { useState } from 'react'

const MOCK_POSTS = [
  {
    id: 1,
    title: 'Feeling overwhelmed today, but finding small moments of gratitude.',
    body: 'Just spent 10 minutes looking out the window and noticing the birds singing. It helped me shift my perspective.',
    author: 'Emily P.',
    date: '2024-02-28',
    likes: 12, comments: 3,
    icon: '😊',
    tags: ['#gratitude', '#mentalhealth', '#support'],
    featured: true,
  },
  {
    id: 2,
    title: 'Three weeks of the gratitude journal and my mornings feel different.',
    body: 'I was sceptical. But writing three things every morning — even tiny things like a good cup of chai — has genuinely shifted something. I feel less reactive.',
    author: 'Rahul M.',
    date: '2024-03-05',
    likes: 28, comments: 7,
    icon: '📓',
    tags: ['#journal', '#morningroutine', '#mindfulness'],
    featured: false,
  },
  {
    id: 3,
    title: 'The 7-Day Gentle Movement challenge changed my relationship with exercise.',
    body: 'I used to think if it wasn\'t a full gym session it didn\'t count. Walking for 20 minutes every day showed me that small, consistent movement is enough. I feel better than I did doing intense workouts.',
    author: 'Sunita K.',
    date: '2024-03-12',
    likes: 44, comments: 11,
    icon: '👣',
    tags: ['#movement', '#habits', '#challenge'],
    featured: false,
  },
  {
    id: 4,
    title: 'A message to anyone having a hard day: you are not behind.',
    body: 'Someone shared that blog post here and I cried reading it. We put so much pressure on ourselves to be at a certain point. You\'re exactly where you need to be. Thank you for this community.',
    author: 'Anonymous',
    date: '2024-03-18',
    likes: 87, comments: 19,
    icon: '💛',
    tags: ['#support', '#positivity', '#mentalhealth'],
    featured: false,
  },
  {
    id: 5,
    title: 'I\'ve started using the Calm Sounds during work and it\'s a game changer.',
    body: 'Rain + Tibetan bowls while coding. I don\'t know the science but I am noticeably calmer and more focused. Recommend everyone try it.',
    author: 'Dev T.',
    date: '2024-03-24',
    likes: 33, comments: 6,
    icon: '🎧',
    tags: ['#calmsounds', '#focus', '#work'],
    featured: false,
  },
  {
    id: 6,
    title: 'Bit Advisor helped me reframe a situation I\'d been stuck in for weeks.',
    body: 'I typed out something I\'d been carrying and the response was so unexpectedly kind and clear. I\'m not saying AI replaces human connection but sometimes you just need to say the thing out loud — even to a bot.',
    author: 'Priya A.',
    date: '2024-04-01',
    likes: 56, comments: 14,
    icon: '✨',
    tags: ['#bitadvisor', '#healing', '#reflection'],
    featured: false,
  },
]

export default function CommunityPage() {
  const [liked, setLiked]     = useState<Set<number>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState({ title: '', body: '', author: '', tags: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const featured = MOCK_POSTS.find(p => p.featured)!

  const toggleLike = (id: number) =>
    setLiked(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/community', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
    } catch { /* non-blocking */ }
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
              <span className="w-6 h-0.5 bg-amber rounded" /> Community
            </div>
            <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-snug mb-4">
              You are not <em className="italic text-amber-soft">alone in this.</em>
            </h1>
            <p className="text-white/72 text-[1.05rem] leading-[1.8] max-w-[480px]">
              Real people. Real stories. A space to share what&apos;s working, what&apos;s hard, and what&apos;s helping.
            </p>
          </div>
          {/* CTA card */}
          <div className="flex-shrink-0 w-full md:w-[320px] bg-white/8 border border-white/15 rounded-[24px] p-7">
            <p className="font-display text-[1.1rem] italic text-amber-soft mb-3">
              Join the Conversation
            </p>
            <p className="text-white/65 text-[0.9rem] leading-[1.7] mb-5">
              What&apos;s one thing you&apos;re grateful for today?
            </p>
            <button
              onClick={() => { setShowForm(true); setTimeout(() => document.getElementById('share-form')?.scrollIntoView({ behavior: 'smooth' }), 100) }}
              className="w-full bg-amber text-charcoal py-3 rounded-full font-semibold text-[0.9rem] hover:bg-amber-soft transition-colors">
              Share Your Story →
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-14 px-[5%]">

        {/* Guidelines */}
        <div className="mb-12 bg-teal-ghost border border-teal-light rounded-[20px] px-7 py-5">
          <p className="text-[0.8rem] font-bold text-teal-deep uppercase tracking-wider mb-2">Community Guidelines</p>
          <div className="flex flex-wrap gap-4">
            {['Be kind and respectful to everyone', 'Share only positive, supportive experiences', 'No advertising or self-promotion', 'Protect your privacy — share only what you\'re comfortable with'].map((rule, i) => (
              <div key={i} className="flex items-center gap-2 text-[0.85rem] text-text-mid">
                <span className="text-teal-mid">✓</span> {rule}
              </div>
            ))}
          </div>
        </div>

        {/* Featured Story */}
        <div className="mb-12">
          <h2 className="font-display text-[1.1rem] text-charcoal font-semibold mb-5">🌟 Featured Story</h2>
          <div className="bg-gradient-to-br from-teal-ghost to-white border-2 border-teal-light rounded-[24px] p-8">
            <div className="flex items-start gap-4">
              <span className="text-[2.5rem] flex-shrink-0">{featured.icon}</span>
              <div className="flex-1">
                <h3 className="font-body font-bold text-[1.05rem] text-charcoal mb-2">{featured.title}</h3>
                <p className="text-text-mid text-[0.95rem] leading-[1.8] mb-4">{featured.body}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[0.8rem] text-text-xlight">
                    <span>— {featured.author}</span>
                    <span>·</span>
                    <span>{new Date(featured.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {featured.tags.map(t => (
                      <span key={t} className="text-[0.7rem] text-teal-mid bg-teal-ghost px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Posts */}
        <div className="mb-14">
          <h2 className="font-display text-[1.1rem] text-charcoal font-semibold mb-6">Recent Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_POSTS.filter(p => !p.featured).map(post => (
              <div key={post.id} className="bg-white border border-teal-light rounded-[24px] p-7 hover:-translate-y-1 hover:shadow-lift transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-[1.8rem] flex-shrink-0">{post.icon}</span>
                  <h3 className="font-body font-semibold text-[0.97rem] text-charcoal leading-snug">{post.title}</h3>
                </div>
                <p className="text-text-mid text-[0.88rem] leading-[1.75] mb-4">{post.body}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.map(t => (
                    <span key={t} className="text-[0.68rem] text-teal-mid bg-teal-ghost px-2.5 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[0.78rem] text-text-xlight border-t border-teal-light/40 pt-4">
                  <span>— {post.author} · {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors ${liked.has(post.id) ? 'text-red-400' : 'hover:text-red-400'}`}>
                    {liked.has(post.id) ? '❤️' : '🤍'} {post.likes + (liked.has(post.id) ? 1 : 0)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share Form */}
        <div id="share-form" className="bg-teal-ghost border border-teal-light rounded-[28px] p-8 md:p-10">
          <h2 className="font-display text-[1.4rem] text-charcoal font-semibold mb-2">Share Your Story</h2>
          <p className="text-text-light text-[0.9rem] mb-6">What&apos;s one thing you&apos;re grateful for today? Stories are reviewed before being published.</p>

          {submitted ? (
            <div className="bg-white border border-teal-light rounded-[20px] p-8 text-center">
              <div className="text-[3rem] mb-3">🌱</div>
              <h3 className="font-display text-[1.2rem] text-teal-deep font-semibold mb-2">Thank you for sharing!</h3>
              <p className="text-text-mid text-[0.9rem]">Your story has been submitted for review. It will appear here once approved.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Title / Headline *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Something small that helped me today..."
                  className="w-full px-4 py-3 bg-white border border-teal-light rounded-[14px] text-[0.9rem] text-charcoal outline-none focus:border-teal-mid transition-colors" />
              </div>
              <div>
                <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Your story *</label>
                <textarea required rows={4} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Share what happened, how you felt, and what helped..."
                  className="w-full px-4 py-3 bg-white border border-teal-light rounded-[14px] text-[0.9rem] text-charcoal outline-none focus:border-teal-mid transition-colors resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Your name (or Anonymous)</label>
                  <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    placeholder="First name or nickname"
                    className="w-full px-4 py-3 bg-white border border-teal-light rounded-[14px] text-[0.9rem] text-charcoal outline-none focus:border-teal-mid transition-colors" />
                </div>
                <div>
                  <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Tags (optional)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="#gratitude #mindfulness"
                    className="w-full px-4 py-3 bg-white border border-teal-light rounded-[14px] text-[0.9rem] text-charcoal outline-none focus:border-teal-mid transition-colors" />
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="bg-teal-deep text-white px-8 py-3.5 rounded-full font-semibold text-[0.95rem] hover:bg-teal-dark transition-colors disabled:opacity-60">
                {submitting ? 'Submitting…' : 'Submit Your Story →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
