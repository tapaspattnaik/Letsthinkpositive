'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console in dev; swap for a real error service in production
    console.error('[App Error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory flex items-center justify-center px-6 pt-[72px]">
      <div className="text-center max-w-[380px]">
        <p className="text-[3.5rem] mb-4">🌿</p>
        <h1 className="font-display text-[1.6rem] font-bold text-charcoal mb-3">
          Something went sideways
        </h1>
        <p className="text-text-mid text-[0.9rem] leading-[1.7] mb-6">
          Don&apos;t worry — it&apos;s not you, it&apos;s us. We&apos;ve noted the issue.
          Try again or head back home.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-teal-deep text-white px-6 py-3 rounded-full font-semibold text-[0.92rem] hover:bg-teal-dark transition-colors">
            Try again
          </button>
          <Link href="/"
            className="border border-teal-mid text-teal-deep px-6 py-3 rounded-full font-semibold text-[0.92rem] no-underline hover:bg-teal-ghost transition-colors">
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
