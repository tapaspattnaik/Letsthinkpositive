'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Circle {
  id: number; slug: string; name: string; description: string
  icon: string; memberCount: number; postCount: number; isMember: boolean
}

export default function CirclesPage() {
  const { data: session } = useSession()
  const [circles,       setCircles]       = useState<Circle[]>([])
  const [joining,       setJoining]       = useState<string | null>(null)
  const [leaving,       setLeaving]       = useState<string | null>(null)
  const [confirmLeave,  setConfirmLeave]  = useState<string | null>(null)
  const [loading,       setLoading]       = useState(true)

  const fetchCircles = () =>
    fetch('/api/circles').then(r => r.json()).then(d => { if (Array.isArray(d)) setCircles(d); setLoading(false) })

  useEffect(() => { fetchCircles() }, [session])

  async function join(slug: string) {
    if (!session) return
    setJoining(slug)
    await fetch(`/api/circles/${slug}/join`, { method: 'POST' })
    await fetchCircles()
    setJoining(null)
  }

  async function leave(slug: string) {
    if (!session) return
    setLeaving(slug)
    await fetch(`/api/circles/${slug}/leave`, { method: 'POST' })
    await fetchCircles()
    setLeaving(null)
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
            <span className="w-6 h-0.5 bg-amber rounded" /> Circles
          </div>
          <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-snug mb-4">
            Private spaces for <em className="italic text-amber-soft">real conversations.</em>
          </h1>
          <p className="text-white/72 text-[1.05rem] leading-[1.8] max-w-[520px]">
            Circles are small, closed groups built around a shared practice. Join one, share freely, and connect with people on the same path.
          </p>
          {!session && (
            <div className="mt-6 flex gap-3">
              <Link href="/register" className="bg-amber text-charcoal px-6 py-2.5 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-amber-soft transition-colors">
                Join free →
              </Link>
              <Link href="/login" className="border border-white/30 text-white px-6 py-2.5 rounded-full font-medium text-[0.9rem] no-underline hover:border-white transition-colors">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-14 px-[5%]">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {circles.map(c => (
              <div key={c.id} className="bg-white border border-teal-light rounded-[24px] p-8 flex flex-col hover:shadow-lift transition-all">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="text-[2.8rem]">{c.icon}</span>
                  {c.isMember && (
                    <span className="bg-teal-ghost text-teal-deep text-[0.7rem] font-bold px-3 py-1 rounded-full tracking-wide flex-shrink-0">
                      ✓ Member
                    </span>
                  )}
                </div>
                <h2 className="font-display text-[1.25rem] font-bold text-charcoal mb-2">{c.name}</h2>
                <p className="text-text-mid text-[0.9rem] leading-[1.75] mb-5 flex-1">{c.description}</p>

                <div className="flex items-center gap-4 text-[0.78rem] text-text-xlight mb-5">
                  <span>👥 {c.memberCount} {c.memberCount === 1 ? 'member' : 'members'}</span>
                  <span>·</span>
                  <span>💬 {c.postCount} {c.postCount === 1 ? 'post' : 'posts'}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">🔒 Private</span>
                </div>

                {c.isMember ? (
                  <div className="flex gap-2">
                    <Link href={`/circles/${c.slug}`}
                      className="flex-1 text-center bg-teal-deep text-white py-3 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-teal-dark transition-colors">
                      Enter Circle →
                    </Link>
                    {confirmLeave === c.slug ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setConfirmLeave(null); leave(c.slug) }}
                          disabled={leaving === c.slug}
                          aria-label={`Confirm leaving ${c.name}`}
                          className="px-3 py-2 rounded-full border border-red-300 bg-red-50 text-red-500 text-[0.78rem] font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors">
                          Leave
                        </button>
                        <button
                          onClick={() => setConfirmLeave(null)}
                          aria-label="Cancel leaving circle"
                          className="px-3 py-2 rounded-full border border-teal-light text-text-mid text-[0.78rem] font-semibold hover:bg-teal-ghost transition-colors">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmLeave(c.slug)}
                        aria-label={`Leave ${c.name}`}
                        className="px-4 py-3 rounded-full border border-red-200 text-red-400 text-[0.82rem] font-semibold hover:bg-red-50 hover:border-red-300 transition-colors">
                        Leave
                      </button>
                    )}
                  </div>
                ) : session ? (
                  <button onClick={() => join(c.slug)} disabled={joining === c.slug}
                    className="w-full border-2 border-teal-mid text-teal-deep py-3 rounded-full font-semibold text-[0.9rem] hover:bg-teal-ghost disabled:opacity-60 transition-colors">
                    {joining === c.slug ? 'Joining…' : 'Join this Circle'}
                  </button>
                ) : (
                  <Link href="/register"
                    className="block w-full text-center border-2 border-teal-mid text-teal-deep py-3 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-teal-ghost transition-colors">
                    Sign up to join
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
