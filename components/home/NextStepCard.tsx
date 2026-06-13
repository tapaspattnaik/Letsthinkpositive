'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// ── "Continue where you left off" ───────────────────────────────────────────
// Surfaces the single most relevant unfinished commitment on the home page.

interface Step { icon: string; title: string; message: string; cta: string; href: string }

export function NextStepCard() {
  const { status } = useSession()
  const [step, setStep] = useState<Step | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/next-step')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.step) setStep(d.step) })
      .catch(() => {})
  }, [status])

  if (status !== 'authenticated' || !step) return null

  return (
    <Link href={step.href}
      className="block rounded-2xl bg-white border-l-4 border-teal-mid border border-teal-light/60 shadow-card p-4 no-underline hover:shadow-lift hover:-translate-y-0.5 transition-all group">
      <div className="flex items-center gap-3">
        <span className="text-[1.6rem] flex-shrink-0">{step.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[0.65rem] font-bold text-teal-mid uppercase tracking-widest mb-0.5">Continue where you left off</p>
          <p className="font-display font-bold text-charcoal text-[0.95rem] leading-snug">{step.title}</p>
          <p className="text-text-xlight text-[0.75rem] mt-0.5">{step.message}</p>
        </div>
        <span className="flex-shrink-0 bg-teal-deep text-white text-[0.78rem] font-semibold px-4 py-2 rounded-full group-hover:bg-teal-dark transition-colors">
          {step.cta} →
        </span>
      </div>
    </Link>
  )
}
