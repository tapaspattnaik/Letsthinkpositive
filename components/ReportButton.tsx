'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

const REASONS = [
  'Offensive or harmful content',
  'Hate speech or discrimination',
  'Spam or self-promotion',
  'Misinformation',
  'Inappropriate for a wellness platform',
  'Harassment or bullying',
  'Other',
]

interface Props {
  postType: 'community' | 'circle' | 'user_blog'
  postId:   number
  /** compact = just a flag icon, no label */
  compact?: boolean
}

export function ReportButton({ postType, postId, compact = false }: Props) {
  const { data: session } = useSession()
  const [open,      setOpen]      = useState(false)
  const [reason,    setReason]    = useState('')
  const [details,   setDetails]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')

  if (!session) return null // only show for logged-in users

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason) return
    setSubmitting(true); setError('')
    try {
      const res  = await fetch('/api/report', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ postType, postId, reason, details }),
      })
      const data = await res.json()
      if (res.ok) { setDone(true); setTimeout(() => { setOpen(false); setDone(false) }, 2500) }
      else          setError(data.error ?? 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Report this post"
        className={`text-text-xlight hover:text-red-400 transition-colors flex items-center gap-1 ${compact ? 'p-1' : 'text-[0.75rem]'}`}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 2h10l-2 5 2 5H3V2z"/>
        </svg>
        {!compact && <span>Report</span>}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="bg-white rounded-[24px] w-full max-w-[420px] shadow-lift overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-teal-light">
              <h3 className="font-display font-bold text-[1.05rem] text-charcoal">Report this post</h3>
              <button onClick={() => setOpen(false)}
                className="text-text-xlight hover:text-charcoal text-[1.2rem] leading-none">×</button>
            </div>

            {done ? (
              <div className="px-6 py-8 text-center">
                <p className="text-[2rem] mb-3">✅</p>
                <p className="font-semibold text-teal-deep">Report submitted</p>
                <p className="text-text-xlight text-[0.83rem] mt-1">Our team will review this and get back to you.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="px-6 py-5 space-y-4">
                <p className="text-[0.83rem] text-text-mid">
                  Help us keep letsthinkpositive.com a safe, positive community. Select a reason and we&apos;ll review it promptly.
                </p>

                <div className="space-y-2">
                  {REASONS.map(r => (
                    <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all
                        ${reason === r ? 'border-teal-deep bg-teal-deep' : 'border-teal-light group-hover:border-teal-mid'}`}>
                        {reason === r && <div className="w-full h-full rounded-full bg-white scale-[0.45]" />}
                      </div>
                      <input type="radio" name="reason" value={r} checked={reason === r}
                        onChange={() => setReason(r)} className="sr-only" />
                      <span className="text-[0.83rem] text-text-mid group-hover:text-charcoal">{r}</span>
                    </label>
                  ))}
                </div>

                <textarea value={details} onChange={e => setDetails(e.target.value)}
                  placeholder="Additional details (optional)…"
                  rows={2}
                  className="w-full border border-teal-light rounded-[12px] px-3 py-2 text-[0.83rem] outline-none focus:border-teal-mid bg-ivory resize-none" />

                {error && <p className="text-red-500 text-[0.8rem]">{error}</p>}

                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={!reason || submitting}
                    className="flex-1 bg-red-500 text-white py-2.5 rounded-full font-semibold text-[0.88rem] hover:bg-red-600 disabled:opacity-50 transition-colors">
                    {submitting ? 'Submitting…' : 'Submit report'}
                  </button>
                  <button type="button" onClick={() => setOpen(false)}
                    className="px-4 py-2.5 border border-teal-light rounded-full text-[0.88rem] text-text-mid hover:bg-teal-ghost transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
