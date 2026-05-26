'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LtpLogo } from '@/components/ui/LtpLogo'

const INTERESTS = [
  'Mindfulness', 'Sleep', 'Gratitude', 'Anxiety Relief',
  'Movement', 'Affirmations', 'Self-Care', 'Meditation',
  'Journaling', 'Community', 'Kids Wellness', 'Creative Arts',
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', bio: '',
  })
  const [selected, setSelected] = useState<string[]>([])
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  function toggle(interest: string) {
    setSelected(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (selected.length === 0) { setError('Please pick at least one interest.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, interests: selected }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      router.push('/login?registered=1')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-ghost to-ivory flex items-start justify-center px-4 py-20 pt-[100px]">
      <div className="w-full max-w-[540px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 no-underline mb-4">
            <LtpLogo size={44} />
          </Link>
          <h1 className="font-display text-[2rem] text-charcoal font-bold">Join the community</h1>
          <p className="text-text-xlight mt-1 text-[0.9rem]">Free forever · No spam · Just good vibes</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-[28px] p-8 shadow-lift border border-teal-light space-y-5">
          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.8rem] font-semibold text-teal-deep mb-1.5">Full name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory" />
            </div>
            <div>
              <label className="block text-[0.8rem] font-semibold text-teal-deep mb-1.5">Phone (optional)</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+44 7700 900000" type="tel"
                className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory" />
            </div>
          </div>

          <div>
            <label className="block text-[0.8rem] font-semibold text-teal-deep mb-1.5">Email address *</label>
            <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory" />
          </div>

          <div>
            <label className="block text-[0.8rem] font-semibold text-teal-deep mb-1.5">Password *</label>
            <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="At least 8 characters" minLength={8}
              className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory" />
          </div>

          <div>
            <label className="block text-[0.8rem] font-semibold text-teal-deep mb-1.5">A little about you (optional)</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="What brings you here? What are you working through, or working towards?"
              rows={3}
              className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory resize-none" />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-[0.8rem] font-semibold text-teal-deep mb-2">What interests you? * <span className="text-text-xlight font-normal">(pick at least one)</span></label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button key={i} type="button" onClick={() => toggle(i)}
                  className={`px-3.5 py-1.5 rounded-full border text-[0.82rem] font-medium transition-all
                    ${selected.includes(i)
                      ? 'bg-teal-deep text-white border-teal-deep'
                      : 'bg-teal-ghost text-text-mid border-teal-light hover:border-teal-mid'}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-[0.85rem] text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-teal-deep text-white py-3.5 rounded-full font-semibold text-[0.97rem] hover:bg-teal-dark transition-colors disabled:opacity-60">
            {loading ? 'Creating your account…' : 'Create my account →'}
          </button>

          <p className="text-center text-[0.83rem] text-text-xlight">
            Already a member?{' '}
            <Link href="/login" className="text-teal-mid font-semibold hover:text-teal-deep no-underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
