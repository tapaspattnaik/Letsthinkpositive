'use client'

import { useState, useEffect, useCallback, useRef, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ReportButton } from '@/components/ReportButton'
import { LinkifiedText, PostImages, ImageAttach } from '@/components/PostContent'

interface CommentType { id: number; body: string; createdAt: string; user: { id: number; name: string; avatarUrl?: string } }
interface Post {
  id: number; body: string; createdAt: string
  images?: string[]
  user: { id: number; name: string; avatarUrl?: string }
  likeCount: number; commentCount: number; likedByMe: boolean
  comments: CommentType[]
  showComments?: boolean
  newComment?: string
  postingComment?: boolean
}
interface CircleInfo { id: number; slug: string; name: string; description: string; icon: string; memberCount: number; isMember: boolean }

export default function CirclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()

  const [circle,   setCircle]   = useState<CircleInfo | null>(null)
  const [posts,    setPosts]    = useState<Post[]>([])
  const [body,     setBody]     = useState('')
  const [images,   setImages]   = useState<string[]>([])
  const [posting,  setPosting]  = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const bottomRef  = useRef<HTMLDivElement>(null)

  const loadCircle = useCallback(async () => {
    const res = await fetch('/api/circles')
    const all = await res.json()
    const found = Array.isArray(all) ? all.find((c: CircleInfo) => c.slug === slug) : null
    setCircle(found ?? null)
    return found
  }, [slug])

  const loadPosts = useCallback(async () => {
    const res = await fetch(`/api/circles/${slug}/posts`)
    if (res.status === 403 || res.status === 401) { setLoading(false); return }
    const data = await res.json()
    if (Array.isArray(data)) setPosts(data.map((p: Post) => ({ ...p, showComments: false, newComment: '' })))
    setLoading(false)
  }, [slug])

  useEffect(() => {
    if (status === 'loading') return
    loadCircle().then(c => { if (c?.isMember) loadPosts(); else setLoading(false) })
  }, [status, loadCircle, loadPosts])

  async function join() {
    if (!session) { router.push('/login'); return }
    await fetch(`/api/circles/${slug}/join`, { method: 'POST' })
    await loadCircle()
    loadPosts()
  }

  async function submitPost(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setPosting(true)
    const res  = await fetch(`/api/circles/${slug}/posts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ body, images }),
    })
    const data = await res.json()
    if (data.id) setPosts(p => [{ ...data, showComments: false, newComment: '', likeCount: 0, commentCount: 0, likedByMe: false }, ...p])
    setBody(''); setImages([]); setPosting(false)
  }

  async function toggleLike(postId: number) {
    const res  = await fetch(`/api/circles/${slug}/posts/${postId}/like`, { method: 'POST' })
    const data = await res.json()
    setPosts(p => p.map(post => post.id === postId ? { ...post, likeCount: data.count, likedByMe: data.liked } : post))
  }

  async function submitComment(postId: number, comment: string) {
    if (!comment.trim()) return
    setPosts(p => p.map(post => post.id === postId ? { ...post, postingComment: true } : post))
    const res  = await fetch(`/api/circles/${slug}/posts/${postId}/comment`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ body: comment }),
    })
    const data = await res.json()
    setPosts(p => p.map(post => post.id === postId
      ? { ...post, comments: [...post.comments, data], commentCount: post.commentCount + 1, newComment: '', postingComment: false }
      : post
    ))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-ghost pt-[72px]">
        <div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}</div>
      </div>
    )
  }

  // Not a member — show locked state
  if (!circle?.isMember) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory flex items-center justify-center px-[5%] pt-[72px]">
        <div className="max-w-[460px] text-center">
          <span className="text-[4rem] block mb-4">{circle?.icon ?? '🔒'}</span>
          <h1 className="font-display text-[1.8rem] font-bold text-charcoal mb-2">{circle?.name ?? 'Private Circle'}</h1>
          <p className="text-text-mid text-[0.95rem] leading-[1.75] mb-3">{circle?.description}</p>
          <p className="text-[0.82rem] text-text-xlight mb-6">👥 {circle?.memberCount ?? 0} members · 🔒 Private</p>
          {session ? (
            <button onClick={join}
              className="bg-teal-deep text-white px-8 py-3.5 rounded-full font-semibold text-[0.95rem] hover:bg-teal-dark transition-colors">
              Join this Circle →
            </button>
          ) : (
            <div className="space-y-3">
              <Link href="/register" className="block bg-teal-deep text-white px-8 py-3.5 rounded-full font-semibold text-[0.95rem] no-underline hover:bg-teal-dark transition-colors">
                Create a free account to join →
              </Link>
              <Link href="/login" className="block text-teal-mid text-[0.88rem] font-semibold no-underline hover:text-teal-deep">
                Already a member? Sign in
              </Link>
            </div>
          )}
          <Link href="/circles" className="block mt-6 text-[0.83rem] text-text-xlight hover:text-teal-mid transition-colors no-underline">
            ← All Circles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px]">
      {/* Header */}
      <div className="bg-white border-b border-teal-light px-[5%] py-5 sticky top-[72px] z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[2rem]">{circle.icon}</span>
            <div>
              <h1 className="font-body font-bold text-[1.05rem] text-charcoal leading-none">{circle.name}</h1>
              <p className="text-[0.75rem] text-text-xlight mt-0.5">🔒 Private · {circle.memberCount} members</p>
            </div>
          </div>
          <Link href="/circles" className="text-[0.8rem] text-text-xlight hover:text-teal-mid transition-colors no-underline">
            ← All Circles
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-[5%] py-8">
        {/* New post */}
        <div className="bg-white border border-teal-light rounded-[24px] p-6 mb-6 shadow-card">
          <form onSubmit={submitPost} className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-ghost flex items-center justify-center flex-shrink-0 overflow-hidden">
                {session?.user?.image
                  ? <Image src={session.user.image} alt="you" width={36} height={36} className="object-cover" />
                  : <span className="text-[0.8rem]">🌿</span>}
              </div>
              <textarea
                value={body} onChange={e => setBody(e.target.value)}
                placeholder={`Share something in ${circle.name}…`}
                rows={3}
                className="flex-1 border border-teal-light rounded-[16px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid transition-colors resize-none bg-ivory placeholder:text-text-xlight"
              />
            </div>
            <div className="flex items-center justify-between gap-3 pl-12">
              <ImageAttach images={images} setImages={setImages} max={4} />
              <button type="submit" disabled={!body.trim() || posting}
                className="bg-teal-deep text-white px-6 py-2.5 rounded-full text-[0.88rem] font-semibold hover:bg-teal-dark disabled:opacity-50 transition-colors flex-shrink-0">
                {posting ? 'Sharing…' : 'Share →'}
              </button>
            </div>
          </form>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[2rem] mb-3">🌱</p>
            <p className="text-text-mid text-[0.93rem]">Be the first to share something in this circle!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white border border-teal-light rounded-[24px] p-6 shadow-card">
                {/* Author row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-teal-ghost flex items-center justify-center overflow-hidden flex-shrink-0">
                    {post.user.avatarUrl
                      ? <Image src={post.user.avatarUrl} alt={post.user.name} width={36} height={36} className="object-cover" />
                      : <span className="text-[0.85rem]">🌿</span>}
                  </div>
                  <div>
                    <Link href={`/profile/${post.user.id}`} className="font-semibold text-[0.9rem] text-charcoal no-underline hover:text-teal-deep">
                      {post.user.name}
                    </Link>
                    <p className="text-[0.72rem] text-text-xlight">
                      {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Body */}
                <LinkifiedText text={post.body} className="text-text-mid text-[0.93rem] leading-[1.8] mb-4 whitespace-pre-wrap" />
                <PostImages images={post.images ?? []} alt={`Post by ${post.user.name}`} />

                {/* Actions */}
                <div className="flex items-center gap-4 border-t border-teal-light/40 pt-3">
                  <button onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-[0.82rem] font-semibold transition-colors
                      ${post.likedByMe ? 'text-red-400' : 'text-text-xlight hover:text-red-400'}`}>
                    {post.likedByMe ? '❤️' : '🤍'} {post.likeCount}
                  </button>
                  <button
                    onClick={() => setPosts(p => p.map(pp => pp.id === post.id ? { ...pp, showComments: !pp.showComments } : pp))}
                    className="flex items-center gap-1.5 text-[0.82rem] font-semibold text-text-xlight hover:text-teal-deep transition-colors">
                    💬 {post.commentCount}
                  </button>
                  <ReportButton postType="circle" postId={post.id} compact />
                </div>

                {/* Comments */}
                {post.showComments && (
                  <div className="mt-4 space-y-3">
                    {post.comments.map(c => (
                      <div key={c.id} className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-teal-ghost flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {c.user.avatarUrl
                            ? <Image src={c.user.avatarUrl} alt={c.user.name} width={28} height={28} className="object-cover" />
                            : <span className="text-[0.7rem]">🌿</span>}
                        </div>
                        <div className="flex-1 bg-teal-ghost rounded-[12px] px-3 py-2">
                          <span className="font-semibold text-[0.8rem] text-charcoal mr-2">{c.user.name}</span>
                          <span className="text-[0.82rem] text-text-mid">{c.body}</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2.5 mt-2">
                      <div className="w-7 h-7 rounded-full bg-teal-ghost flex items-center justify-center flex-shrink-0">
                        <span className="text-[0.7rem]">🌿</span>
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          value={post.newComment ?? ''}
                          onChange={e => setPosts(p => p.map(pp => pp.id === post.id ? { ...pp, newComment: e.target.value } : pp))}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(post.id, post.newComment ?? '') } }}
                          placeholder="Reply…"
                          className="flex-1 border border-teal-light rounded-full px-4 py-1.5 text-[0.83rem] outline-none focus:border-teal-mid bg-ivory"
                        />
                        <button
                          onClick={() => submitComment(post.id, post.newComment ?? '')}
                          disabled={!post.newComment?.trim() || post.postingComment}
                          className="bg-teal-deep text-white px-4 py-1.5 rounded-full text-[0.78rem] font-semibold hover:bg-teal-dark disabled:opacity-50 transition-colors">
                          {post.postingComment ? '…' : 'Send'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
