'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface FollowState {
  followerCount: number
  followingCount: number
  isFollowing: boolean
}

export function FollowButton({ userId }: { userId: number }) {
  const { data: session } = useSession()
  const [state,    setState]    = useState<FollowState | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [toggling, setToggling] = useState(false)

  const isOwnProfile = session?.user?.id !== undefined && Number(session.user.id) === userId

  useEffect(() => {
    fetch(`/api/follow/${userId}`)
      .then(r => r.json())
      .then(d => { setState(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [userId])

  async function toggle() {
    if (!session || isOwnProfile) return
    setToggling(true)
    const res  = await fetch(`/api/follow/${userId}`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      // POST returns { following, followerCount } — merge with existing state
      setState(prev => prev ? {
        ...prev,
        isFollowing:   data.following,
        followerCount: data.followerCount,
      } : null)
    }
    setToggling(false)
  }

  if (loading || !state) return null

  return (
    <div className="flex items-center gap-4 mt-4 justify-center flex-wrap">
      {/* Stats */}
      <div className="flex gap-5 text-center">
        <div>
          <p className="font-bold text-[1.1rem] text-charcoal">{state.followerCount}</p>
          <p className="text-[0.72rem] text-text-xlight">Followers</p>
        </div>
        <div>
          <p className="font-bold text-[1.1rem] text-charcoal">{state.followingCount}</p>
          <p className="text-[0.72rem] text-text-xlight">Following</p>
        </div>
      </div>

      {/* Follow/Unfollow button */}
      {!isOwnProfile && session && (
        <button
          onClick={toggle}
          disabled={toggling}
          className={`px-6 py-2.5 rounded-full font-semibold text-[0.88rem] transition-all disabled:opacity-60 ${
            state.isFollowing
              ? 'bg-teal-ghost border border-teal-mid text-teal-deep hover:bg-red-50 hover:border-red-300 hover:text-red-500'
              : 'bg-teal-deep text-white hover:bg-teal-dark'
          }`}
        >
          {toggling ? '…' : state.isFollowing ? 'Following ✓' : '+ Follow'}
        </button>
      )}

      {!session && (
        <Link href="/login"
          className="px-6 py-2.5 rounded-full font-semibold text-[0.88rem] bg-teal-deep text-white no-underline hover:bg-teal-dark transition-colors">
          + Follow
        </Link>
      )}
    </div>
  )
}
