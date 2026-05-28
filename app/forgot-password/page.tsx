'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LtpLogo } from '@/components/ui/LtpLogo'

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error,     setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setLoading(true); setError('')
    try {
      await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-ghost to-ivory flex items-center justify-center px-4 pt-[72px]">
      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-[28px] shadow-lift border border-teal-light px-8 py-10">
          <div className="flex justify-center mb-6">
            <LtpLogo size={52} />
          </div>

          {submitted ? (
            <div className="text-center">
              <div className="text-[3rem] mb-4">📬</div>
              <h1 className="font-display text-[1.5rem] font-bold text-charcoal mb-3">Check your inbox</h1>
              <p className="text-text-mid text-[0.9rem] leading-[1.75] mb-6">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link. It&apos;s valid for <strong>1 hour</strong>.
              </p>
              <p className="text-text-xlight text-[0.8rem] mb-6">
                Don&apos;t see it? Check your spam folder.
              </p>
              <Link href="/login"
                className="block w-full bg-teal-deep text-white py-3 rounded-full font-semibold text-[0.9rem] text-center no-underline hover:bg-teal-dark transition-colors">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-[1.5rem] font-bold text-charcoal text-center mb-2">Forgot your password?</h1>
              <p className="text-text-xlight text-[0.85rem] text-center mb-8">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-[0.85rem] px-4 py-3 rounded-[12px] mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-teal-light rounded-[12px] px-4 py-3 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory"
                    required
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-teal-deep text-white py-3 rounded-full font-semibold text-[0.93rem] hover:bg-teal-dark disabled:opacity-60 transition-colors mt-2">
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <p className="text-center text-[0.82rem] text-text-xlight mt-6">
                Remember it?{' '}
                <Link href="/login" className="text-teal-mid hover:text-teal-deep font-semibold no-underline transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
