'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { LinkifiedText, PostImages } from '@/components/PostContent'
import { TrendingHashtags } from '@/components/TrendingHashtags'

interface Post {
  id: number; title: string; body: string; author: string; tags: string
  images: string[]; createdAt: string
  user: { id: number; name: string; avatarUrl: string | null } | null
  likeCount: number; commentCount: number; likedByMe: boolean
}

const STORY_ICONS = ['😊','📓','👣','💛','🎧','✨','🌿','🌸','🌙','⭐']

export default function HashtagPage() {
  const params   = useParams<{ tag: string }>()
  const tag      = decodeURIComponent(params.tag ?? '').replace(/^#/, '').toLowerCase()
  const [posts,    setPosts]    = useState<Post[]>([])
  const [count,    setCount]    = useState(0)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!tag) return
    setLoading(true)
    fetch(`/api/hashtag/${encodeURIComponent(tag)}`)
      .then(r => r.ok ? r.json() : { posts: [], count: 0 })
      .then(d => { setPosts(d.posts ?? []); setCount(d.count ?? 0) })
      .finally(() => setLoading(false))
  }, [tag])

  async function toggleLike(postId: number) {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1, likedByMe: !p.likedByMe }
        : p
    ))
    try {
      const res = await fetch(`/api/community/${postId}/like`, { method: 'POST' })
      if (res.ok) {
        const { count: c, liked } = await res.json()
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likeCount: c, likedByMe: liked } : p))
      } else {
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, likeCount: p.likedByMe ? p.likeCount + 1 : p.likeCount - 1, likedByMe: !p.likedByMe }
            : p
        ))
      }
    } catch { /* revert handled above */ }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9f7] to-ivory pt-[72px]">
      <div className="max-w-5xl mx-auto px-[5%] py-8">

        {/* Header */}
        <div className="mb-6">
          <Link href="/community" className="text-text-xlight text-[0.78rem] hover:text-teal-deep no-underline transition-colors flex items-center gap-1.5 mb-4">
            ← Community
          </Link>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-teal-deep text-white px-5 py-2.5 rounded-full text-[1.2rem] font-bold font-display">
              #{tag}
            </div>
            <div>
              <p className="text-charcoal font-semibold text-[1rem]">{count} posts tagged with this</p>
              <p className="text-text-xlight text-[0.78rem]">Community posts · most recent first</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

          {/* Posts */}
          <div className="space-y-4">
            {loading && (
              <div className="flex justify-center py-16">
                <div className="flex gap-1.5">
                  {[0,1,2].map(i => <span key={i} className="w-3 h-3 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay:`${i*150}ms` }} />)}
                </div>
              </div>
            )}

            {!loading && posts.length === 0 && (
              <div className="bg-white rounded-[24px] p-12 shadow-card border border-teal-light/60 text-center">
                <p className="text-[3rem] mb-4">🏷️</p>
                <h2 className="font-display font-bold text-charcoal text-[1.1rem] mb-2">No posts with #{tag} yet</h2>
                <p className="text-text-mid text-[0.88rem] mb-6">Be the first to share something with this hashtag!</p>
                <Link href="/community"
                  className="inline-block bg-teal-deep text-white px-6 py-2.5 rounded-full font-semibold text-[0.88rem] no-underline hover:bg-teal-dark transition-colors">
                  Share on Community Wall →
                </Link>
              </div>
            )}

            {!loading && posts.map(post => {
              const icon    = STORY_ICONS[post.id % STORY_ICONS.length]
              const tags    = post.tags ? post.tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean) : []
              const dateStr = new Date(post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

              return (
                <div key={post.id} className="bg-white border border-teal-light/60 rounded-[24px] p-6 shadow-card hover:shadow-lift transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-[1.8rem] flex-shrink-0">{icon}</span>
                    <h3 className="font-semibold text-[0.97rem] text-charcoal leading-snug">{post.title}</h3>
                  </div>
                  <LinkifiedText text={post.body} className="text-text-mid text-[0.88rem] leading-[1.75] mb-4" />
                  <PostImages images={post.images} alt={post.title} />

                  {/* Tags — current tag highlighted */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {tags.map(t => (
                        <Link key={t} href={`/hashtag/${t}`}
                          className={`text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full no-underline transition-colors
                            ${t === tag
                              ? 'bg-teal-deep text-white'
                              : 'bg-teal-ghost text-teal-mid hover:text-teal-deep hover:bg-teal-light/40'}`}>
                          #{t}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-4 pt-3 border-t border-teal-light/40 text-text-xlight text-[0.78rem]">
                    {/* Author */}
                    <div className="flex items-center gap-1.5">
                      {post.user?.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.user.avatarUrl} alt={post.user?.name ?? ''} referrerPolicy="no-referrer"
                          className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-teal-ghost flex items-center justify-center text-teal-deep font-bold text-[0.55rem]">
                          {(post.user?.name ?? post.author).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{post.user?.name ?? post.author}</span>
                    </div>
                    <span>{dateStr}</span>
                    {/* Like */}
                    <button onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 ml-auto transition-colors ${post.likedByMe ? 'text-red-400' : 'hover:text-red-400'}`}>
                      <svg className={`w-3.5 h-3.5 ${post.likedByMe ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                      {post.likeCount}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Trending sidebar */}
          <div className="sticky top-[88px]">
            <TrendingHashtags />
          </div>
        </div>
      </div>
    </div>
  )
}
