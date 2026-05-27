'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Notification {
  id: number
  type: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

const TYPE_ICONS: Record<string, string> = {
  like:            '❤️',
  comment:         '💬',
  blog_approved:   '✅',
  blog_rejected:   '❌',
  report_resolved: '🛡️',
  circle_post:     '🔒',
}

const TYPE_LABELS: Record<string, string> = {
  like:            'Like',
  comment:         'Comment',
  blog_approved:   'Blog approved',
  blog_rejected:   'Blog rejected',
  report_resolved: 'Report update',
  circle_post:     'Circle post',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function groupByDate(notifications: Notification[]) {
  const groups: { label: string; items: Notification[] }[] = []
  const map = new Map<string, Notification[]>()

  for (const n of notifications) {
    const d   = new Date(n.createdAt)
    const now = new Date()
    let label: string
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
    if (diffDays === 0) label = 'Today'
    else if (diffDays === 1) label = 'Yesterday'
    else if (diffDays < 7)  label = 'This week'
    else                    label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

    if (!map.has(label)) map.set(label, [])
    map.get(label)!.push(n)
  }

  map.forEach((items, label) => groups.push({ label, items }))
  return groups
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading,       setLoading]       = useState(true)
  const [filter,        setFilter]        = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const fetchAll = useCallback(async () => {
    if (!session?.user?.id) return
    const res = await fetch('/api/notifications')
    if (res.ok) setNotifications(await res.json())
    setLoading(false)
  }, [session?.user?.id])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function markRead(id: number) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
  }

  const visible = filter === 'unread' ? notifications.filter(n => !n.read) : notifications
  const grouped = groupByDate(visible)
  const unreadCount = notifications.filter(n => !n.read).length

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-[72px]">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px]">
      <div className="max-w-2xl mx-auto px-[5%] py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-[1.8rem] font-bold text-charcoal leading-tight">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-[0.82rem] text-text-xlight mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="text-[0.82rem] text-teal-mid hover:text-teal-deep font-semibold border border-teal-light px-4 py-2 rounded-full hover:bg-teal-ghost transition-colors">
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[0.82rem] font-medium capitalize transition-all
                ${filter === f ? 'bg-teal-deep text-white' : 'bg-white border border-teal-light text-text-mid hover:bg-teal-ghost'}`}>
              {f === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Notification groups */}
        {grouped.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-teal-light p-14 text-center shadow-lift">
            <p className="text-[2.5rem] mb-3">🔔</p>
            <p className="text-[1rem] font-semibold text-charcoal mb-1">
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </p>
            <p className="text-[0.85rem] text-text-xlight">
              {filter === 'unread'
                ? 'You have no unread notifications.'
                : 'Notifications will appear here when someone likes or comments on your posts.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ label, items }) => (
              <div key={label}>
                <p className="text-[0.72rem] font-bold tracking-[0.15em] uppercase text-text-xlight mb-3">{label}</p>
                <div className="bg-white rounded-[20px] border border-teal-light shadow-lift overflow-hidden">
                  {items.map((n, idx) => (
                    <div key={n.id}
                      className={`flex gap-4 px-5 py-4 transition-colors
                        ${idx < items.length - 1 ? 'border-b border-teal-light/40' : ''}
                        ${!n.read ? 'bg-teal-ghost/20' : 'hover:bg-teal-ghost/10'}`}>

                      {/* Icon */}
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-teal-ghost flex items-center justify-center text-[1rem]">
                        {TYPE_ICONS[n.type] ?? '🔔'}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-teal-mid">
                              {TYPE_LABELS[n.type] ?? 'Notification'}
                            </span>
                            {n.link ? (
                              <Link href={n.link} onClick={() => markRead(n.id)}
                                className="block text-[0.88rem] text-charcoal leading-snug mt-0.5 no-underline hover:text-teal-deep transition-colors">
                                {n.message}
                              </Link>
                            ) : (
                              <p className="text-[0.88rem] text-charcoal leading-snug mt-0.5">{n.message}</p>
                            )}
                            <p className="text-[0.73rem] text-text-xlight mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                          {!n.read && (
                            <button onClick={() => markRead(n.id)}
                              className="flex-shrink-0 w-2 h-2 rounded-full bg-amber mt-2 hover:scale-125 transition-transform"
                              aria-label="Mark as read" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
