'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { LtpLogo } from '@/components/ui/LtpLogo'

function LoginForm() {
  const router       = useRouter()
  const params       = useSearchParams()
  const justRegistered = params.get('registered') === '1'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) { setError('Incorrect email or password. Please try again.'); return }
    router.push('/profile')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-ghost to-ivory flex items-center justify-center px-4 pt-[72px]">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 no-underline mb-4">
            <LtpLogo size={44} />
          </Link>
          <h1 className="font-display text-[2rem] text-charcoal font-bold">Welcome back</h1>
          {justRegistered
            ? <p className="text-teal-mid text-[0.9rem] mt-1 font-semibold">Account created! Sign in to continue 🌿</p>
            : <p className="text-text-xlight mt-1 text-[0.9rem]">Sign in to your account</p>}
        </div>

        <form onSubmit={submit} className="bg-white rounded-[28px] p-8 shadow-lift border border-teal-light space-y-4">
          <div>
            <label className="block text-[0.8rem] font-semibold text-teal-deep mb-1.5">Email address</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory" />
          </div>
          <div>
            <label className="block text-[0.8rem] font-semibold text-teal-deep mb-1.5">Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid transition-colors bg-ivory" />
          </div>

          {error && <p className="text-red-500 text-[0.85rem] text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-teal-deep text-white py-3.5 rounded-full font-semibold text-[0.97rem] hover:bg-teal-dark transition-colors disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>

          <p className="text-center text-[0.83rem] text-text-xlight">
            New here?{' '}
            <Link href="/register" className="text-teal-mid font-semibold hover:text-teal-deep no-underline">Create a free account</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
