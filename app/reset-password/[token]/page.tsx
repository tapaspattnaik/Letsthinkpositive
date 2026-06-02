'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LtpLogo } from '@/components/ui/LtpLogo'

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState('')
  const [showPwd,   setShowPwd]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return }
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
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

          {success ? (
            <div className="text-center">
              <div className="text-[3rem] mb-4">✅</div>
              <h1 className="font-display text-[1.5rem] font-bold text-charcoal mb-3">Password updated!</h1>
              <p className="text-text-mid text-[0.9rem] leading-[1.75] mb-6">
                Your password has been changed successfully. Redirecting you to sign in…
              </p>
              <Link href="/login"
                className="block w-full bg-teal-deep text-white py-3 rounded-full font-semibold text-[0.9rem] text-center no-underline hover:bg-teal-dark transition-colors">
                Sign in now →
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-[1.5rem] font-bold text-charcoal text-center mb-2">Set a new password</h1>
              <p className="text-text-xlight text-[0.85rem] text-center mb-8">
                Choose a strong password you haven&apos;t used before.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-[0.85rem] px-4 py-3 rounded-[12px] mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full border border-teal-light rounded-[12px] px-4 py-3 pr-12 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory"
                      required
                    />
                    <button type="button" onClick={() => setShowPwd(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-xlight hover:text-teal-deep text-[0.85rem] transition-colors">
                      {showPwd ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Confirm new password</label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full border border-teal-light rounded-[12px] px-4 py-3 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory"
                    required
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-teal-deep text-white py-3 rounded-full font-semibold text-[0.93rem] hover:bg-teal-dark disabled:opacity-60 transition-colors mt-2">
                  {loading ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
