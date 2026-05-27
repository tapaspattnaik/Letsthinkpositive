'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Report {
  id: number; postType: string; postId: number; reason: string; details?: string
  status: string; adminNote?: string; createdAt: string; resolvedAt?: string
  postSnippet: string; postAuthor: string; postDeleted: boolean
  reporter: { id: number; name: string; email: string; avatarUrl?: string }
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d  < 7)  return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports,     setReports]     = useState<Report[]>([])
  const [filter,      setFilter]      = useState<'pending' | 'resolved' | 'all'>('pending')
  const [loading,     setLoading]     = useState(true)
  const [activeId,    setActiveId]    = useState<number | null>(null)
  const [adminNote,   setAdminNote]   = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [toast,       setToast]       = useState('')

  const load = useCallback(async (f: string) => {
    setLoading(true)
    const res  = await fetch(`/api/admin/reports?status=${f}`)
    if (res.status === 403) { router.push('/'); return }
    const data = await res.json()
    setReports(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/login'); return }
    load(filter)
  }, [status, session, filter, load, router])

  async function resolve(reportId: number, action: 'remove' | 'keep' | 'dismiss') {
    if (!adminNote.trim() && action !== 'dismiss') {
      setToast('Please add a note for the reporter before resolving.')
      setTimeout(() => setToast(''), 3000)
      return
    }
    setSubmitting(true)
    const res = await fetch(`/api/admin/reports/${reportId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ adminNote, action }),
    })
    if (res.ok) {
      setToast(action === 'remove' ? '✓ Post removed & reporter notified' : '✓ Report resolved & reporter notified')
      setActiveId(null); setAdminNote('')
      setTimeout(() => { setToast(''); load(filter) }, 2000)
    }
    setSubmitting(false)
  }

  if (status === 'loading' || loading) return (
    <div className="min-h-screen flex items-center justify-center pt-[72px]">
      <div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}</div>
    </div>
  )

  const activeReport = reports.find(r => r.id === activeId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px]">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-teal-deep text-white px-6 py-3 rounded-full shadow-lift text-[0.88rem] font-semibold pointer-events-none">
          {toast}
        </div>
      )}

      <div className="bg-white border-b border-teal-light px-[5%] py-5 sticky top-[72px] z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display font-bold text-[1.2rem] text-charcoal">Admin · Content Reports</h1>
            <p className="text-[0.75rem] text-text-xlight mt-0.5">Review flagged posts and respond to reporters</p>
          </div>
          <div className="flex gap-2">
            {(['pending', 'resolved', 'all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[0.8rem] font-semibold capitalize transition-all
                  ${filter === f ? 'bg-teal-deep text-white' : 'border border-teal-light text-text-mid hover:bg-teal-ghost'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-[5%] py-8">
        {reports.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[3rem] mb-4">✅</p>
            <p className="text-text-mid font-semibold">No {filter} reports</p>
            <p className="text-text-xlight text-[0.85rem] mt-1">Community is looking healthy!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(r => (
              <div key={r.id} className={`bg-white rounded-[20px] border overflow-hidden transition-all
                ${r.status === 'pending' ? 'border-amber/60 shadow-card' : 'border-teal-light'}`}>

                <div className="flex items-start gap-4 p-5">
                  <div className="w-9 h-9 rounded-full bg-teal-ghost flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {r.reporter.avatarUrl
                      ? <Image src={r.reporter.avatarUrl} alt={r.reporter.name} width={36} height={36} className="object-cover" />
                      : <span className="text-[0.8rem]">🌿</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide
                        ${r.status === 'pending' ? 'bg-amber/20 text-amber-700' : 'bg-teal-ghost text-teal-deep'}`}>
                        {r.status}
                      </span>
                      <span className="text-[0.65rem] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {r.postType.replace('_', ' ')}
                      </span>
                      {r.postDeleted && (
                        <span className="text-[0.65rem] bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Post already deleted</span>
                      )}
                    </div>

                    <p className="text-[0.82rem] text-text-mid mb-1">
                      <strong className="text-charcoal">{r.reporter.name}</strong>
                      <span className="text-text-xlight"> · {r.reporter.email} · {timeAgo(r.createdAt)}</span>
                    </p>
                    <p className="text-[0.85rem] font-semibold text-red-500 mb-1">⚑ {r.reason}</p>
                    {r.details && <p className="text-[0.8rem] text-text-mid italic mb-2">&ldquo;{r.details}&rdquo;</p>}

                    {r.postSnippet && !r.postDeleted && (
                      <div className="bg-teal-ghost/50 rounded-[10px] px-3 py-2 mt-2">
                        <p className="text-[0.73rem] text-text-xlight mb-0.5">Reported post by <strong>{r.postAuthor}</strong>:</p>
                        <p className="text-[0.8rem] text-text-mid line-clamp-3">{r.postSnippet}</p>
                      </div>
                    )}

                    {r.adminNote && r.status === 'resolved' && (
                      <div className="border-l-4 border-teal-mid bg-teal-ghost/30 px-3 py-2 mt-3 rounded-r-[8px]">
                        <p className="text-[0.72rem] text-text-xlight mb-0.5">Admin response sent to reporter:</p>
                        <p className="text-[0.82rem] text-teal-deep italic">{r.adminNote}</p>
                      </div>
                    )}
                  </div>

                  {r.status === 'pending' && (
                    <button onClick={() => { setActiveId(activeId === r.id ? null : r.id); setAdminNote('') }}
                      className="flex-shrink-0 bg-teal-deep text-white px-4 py-2 rounded-full text-[0.8rem] font-semibold hover:bg-teal-dark transition-colors">
                      {activeId === r.id ? 'Cancel' : 'Review →'}
                    </button>
                  )}
                </div>

                {/* Action panel */}
                {activeId === r.id && activeReport && (
                  <div className="border-t border-teal-light px-5 py-5 bg-teal-ghost/10 space-y-4">
                    <div>
                      <label className="block text-[0.78rem] font-semibold text-charcoal mb-1.5">
                        Message to reporter <span className="text-text-xlight font-normal">(will be emailed to them — required for Remove/Keep)</span>
                      </label>
                      <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                        placeholder='e.g. "We reviewed this post and removed it as it violated our community guidelines." or "We reviewed this and found it does not violate our guidelines — the post remains live."'
                        rows={3}
                        className="w-full border border-teal-light rounded-[12px] px-4 py-2.5 text-[0.85rem] outline-none focus:border-teal-mid bg-white resize-none" />
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <button onClick={() => resolve(r.id, 'remove')} disabled={submitting || r.postDeleted}
                        className="bg-red-500 text-white px-5 py-2.5 rounded-full text-[0.85rem] font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2">
                        🗑️ Remove post &amp; notify reporter
                      </button>
                      <button onClick={() => resolve(r.id, 'keep')} disabled={submitting}
                        className="bg-teal-deep text-white px-5 py-2.5 rounded-full text-[0.85rem] font-semibold hover:bg-teal-dark disabled:opacity-50 transition-colors flex items-center gap-2">
                        ✓ Keep post &amp; notify reporter
                      </button>
                      <button onClick={() => resolve(r.id, 'dismiss')} disabled={submitting}
                        className="border border-teal-light text-text-mid px-5 py-2.5 rounded-full text-[0.85rem] font-semibold hover:bg-teal-ghost disabled:opacity-50 transition-colors">
                        Dismiss silently
                      </button>
                    </div>
                    <p className="text-[0.72rem] text-text-xlight leading-[1.6]">
                      The reporter&apos;s email address will receive your message automatically. All actions are logged.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
