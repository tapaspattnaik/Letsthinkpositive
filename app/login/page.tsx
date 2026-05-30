'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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

function LoginForm() {
  const router         = useRouter()
  const params         = useSearchParams()
  const justRegistered = params.get('registered') === '1'
  // Preserve the page the user was trying to reach before being redirected to login
  const callbackUrl    = params.get('callbackUrl') || '/profile'

  const [email,       setEmail]      = useState('')
  const [password,    setPassword]   = useState('')
  const [error,       setError]      = useState('')
  const [loading,     setLoading]    = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) { setError('Incorrect email or password. Please try again.'); return }
    // Redirect back to where they came from, or profile
    router.push(callbackUrl)
    router.refresh()
  }

  async function signInWithGoogle() {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-ghost to-ivory flex items-center justify-center px-4 pt-[72px]">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 no-underline mb-4">
            <LtpLogo size={44} />
          </Link>
          <h1 className="font-display text-[2rem] text-charcoal font-bold">Welcome back</h1>
          <p className="text-text-xlight mt-1 text-[0.9rem]">Sign in to your account</p>
        </div>

        {justRegistered && (
          <div className="flex items-center gap-3 bg-teal-ghost border border-teal-mid rounded-[20px] px-5 py-4 mb-5 animate-fade-in">
            <span className="text-[1.8rem] flex-shrink-0">🎉</span>
            <div>
              <p className="text-teal-deep font-bold text-[0.95rem] leading-none mb-1">Account created successfully!</p>
              <p className="text-teal-mid text-[0.82rem]">Sign in below to get started 🌿</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[28px] p-8 shadow-lift border border-teal-light space-y-4">
          {/* Google sign-in */}
          <button
            onClick={signInWithGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-teal-light rounded-full py-3 text-[0.93rem] font-semibold text-charcoal hover:bg-teal-ghost hover:border-teal-mid transition-all disabled:opacity-60">
            <GoogleIcon />
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-teal-light" />
            <span className="text-[0.75rem] text-text-xlight font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-teal-light" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-[0.8rem] font-semibold text-teal-deep mb-1.5">Email address</label>
              <input id="login-email" required type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email"
                aria-describedby={error ? 'login-error' : undefined}
                className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-[0.8rem] font-semibold text-teal-deep">Password</label>
                <Link href="/forgot-password" className="text-[0.78rem] text-teal-mid hover:text-teal-deep no-underline transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input id="login-password" required type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Your password" autoComplete="current-password"
                aria-describedby={error ? 'login-error' : undefined}
                className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory" />
            </div>

            {error && <p id="login-error" role="alert" className="text-red-500 text-[0.85rem] text-center">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-teal-deep text-white py-3.5 rounded-full font-semibold text-[0.97rem] hover:bg-teal-dark transition-colors disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <p className="text-center text-[0.83rem] text-text-xlight">
            New here?{' '}
            <Link href="/register" className="text-teal-mid font-semibold hover:text-teal-deep no-underline">Create a free account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
