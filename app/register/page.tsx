'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { LtpLogo } from '@/components/ui/LtpLogo'

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

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
  const [agreed,   setAgreed]   = useState(false)
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
    if (!agreed) { setError('Please agree to the Terms & Conditions to continue.'); return }
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
          {/* Google sign-up */}
          <button type="button"
            onClick={() => signIn('google', { callbackUrl: '/profile' })}
            className="w-full flex items-center justify-center gap-3 border border-teal-light rounded-full py-3 text-[0.93rem] font-semibold text-charcoal hover:bg-teal-ghost hover:border-teal-mid transition-all">
            <GoogleIcon />
            Sign up with Google
          </button>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-teal-light" />
            <span className="text-[0.75rem] text-text-xlight font-medium">or create account with email</span>
            <div className="flex-1 h-px bg-teal-light" />
          </div>

          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-name" className="block text-[0.8rem] font-semibold text-teal-deep mb-1.5">Full name *</label>
              <input id="reg-name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name" autoComplete="name"
                aria-describedby={error ? 'reg-error' : undefined}
                className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory" />
            </div>
            <div>
              <label htmlFor="reg-phone" className="block text-[0.8rem] font-semibold text-teal-deep mb-1.5">Phone (optional)</label>
              <input id="reg-phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+44 7700 900000" type="tel" autoComplete="tel"
                className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory" />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-[0.8rem] font-semibold text-teal-deep mb-1.5">Email address *</label>
            <input id="reg-email" required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com" autoComplete="email"
              aria-describedby={error ? 'reg-error' : undefined}
              className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory" />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-[0.8rem] font-semibold text-teal-deep mb-1.5">Password *</label>
            <input id="reg-password" required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="At least 8 characters" minLength={8} autoComplete="new-password"
              aria-describedby={error ? 'reg-error' : undefined}
              className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory" />
          </div>

          <div>
            <label htmlFor="reg-bio" className="block text-[0.8rem] font-semibold text-teal-deep mb-1.5">A little about you (optional)</label>
            <textarea id="reg-bio" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
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
                  aria-pressed={selected.includes(i)}
                  className={`px-3.5 py-1.5 rounded-full border text-[0.82rem] font-medium transition-all
                    ${selected.includes(i)
                      ? 'bg-teal-deep text-white border-teal-deep'
                      : 'bg-teal-ghost text-text-mid border-teal-light hover:border-teal-mid'}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Terms & Conditions */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="peer sr-only"
              />
              <div className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all
                ${agreed ? 'bg-teal-deep border-teal-deep' : 'bg-white border-teal-light group-hover:border-teal-mid'}`}>
                {agreed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5"/></svg>}
              </div>
            </div>
            <span className="text-[0.83rem] text-text-mid leading-[1.6]">
              I agree to the{' '}
              <Link href="/terms" className="text-teal-mid font-semibold hover:text-teal-deep no-underline">Terms &amp; Conditions</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-teal-mid font-semibold hover:text-teal-deep no-underline">Privacy Policy</Link>.
              I understand this is a wellness community and not a substitute for professional medical advice.
            </span>
          </label>

          {error && <p id="reg-error" role="alert" className="text-red-500 text-[0.85rem] text-center">{error}</p>}

          <button type="submit" disabled={loading || !agreed}
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
