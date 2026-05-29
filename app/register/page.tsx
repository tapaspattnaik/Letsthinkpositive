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

// ── Password strength helpers ─────────────────────────────────────────────
const RULES = [
  { id: 'len',     label: 'At least 8 characters',       test: (p: string) => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter (A–Z)',   test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number',  label: 'One number (0–9)',             test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character (!@#…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

function strength(p: string): 0 | 1 | 2 | 3 {
  const passed = RULES.filter(r => r.test(p)).length
  if (passed <= 1) return 1
  if (passed === 2 || passed === 3) return 2
  return 3
}

const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Strong']
const STRENGTH_COLOR = ['', 'bg-red-400', 'bg-amber', 'bg-teal-mid']
const STRENGTH_TEXT  = ['', 'text-red-500', 'text-amber', 'text-teal-mid']

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', phone: '', bio: '',
  })
  const [selected,     setSelected]     = useState<string[]>([])
  const [agreed,       setAgreed]       = useState(false)
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [pwFocused,    setPwFocused]    = useState(false)

  const pwStrength = form.password ? strength(form.password) : 0

  function toggle(interest: string) {
    setSelected(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8)           { setError('Password must be at least 8 characters.'); return }
    if (pwStrength < 2)                      { setError('Password is too weak — add uppercase letters, numbers or symbols.'); return }
    if (form.password !== form.confirm)      { setError('Passwords do not match.'); return }
    if (selected.length === 0)               { setError('Please pick at least one interest.'); return }
    if (!agreed)                             { setError('Please agree to the Terms & Conditions to continue.'); return }
    setError('')
    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirm: _confirm, ...payload } = form
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...payload, interests: selected }),
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

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-[0.8rem] font-semibold text-teal-deep mb-1.5">Password *</label>
            <div className="relative">
              <input
                id="reg-password" required
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 pr-11 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory" />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-xlight hover:text-charcoal transition-colors text-[0.85rem]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Strength bar */}
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwStrength ? STRENGTH_COLOR[pwStrength] : 'bg-teal-light'}`} />
                  ))}
                </div>
                <p className={`text-[0.73rem] font-semibold ${STRENGTH_TEXT[pwStrength]}`}>
                  {STRENGTH_LABEL[pwStrength]}
                </p>
              </div>
            )}

            {/* Rules checklist — shown while focused or if weak */}
            {(pwFocused || (form.password && pwStrength < 3)) && (
              <ul className="mt-2 space-y-1">
                {RULES.map(rule => {
                  const pass = rule.test(form.password)
                  return (
                    <li key={rule.id} className={`flex items-center gap-1.5 text-[0.75rem] transition-colors ${pass ? 'text-teal-mid' : 'text-text-xlight'}`}>
                      <span className="text-[0.7rem]">{pass ? '✅' : '○'}</span>
                      {rule.label}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="reg-confirm" className="block text-[0.8rem] font-semibold text-teal-deep mb-1.5">Confirm password *</label>
            <div className="relative">
              <input
                id="reg-confirm" required
                type={showPassword ? 'text' : 'password'}
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className={`w-full border rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory
                  ${form.confirm && form.confirm !== form.password ? 'border-red-300 focus:border-red-400' : 'border-teal-light'}`} />
              {form.confirm && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.85rem]">
                  {form.confirm === form.password ? '✅' : '❌'}
                </span>
              )}
            </div>
            {form.confirm && form.confirm !== form.password && (
              <p className="text-[0.73rem] text-red-500 mt-1">Passwords do not match</p>
            )}
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
