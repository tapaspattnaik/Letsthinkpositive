'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
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
  follow:          '👤',
  blog_approved:   '✅',
  blog_rejected:   '❌',
  report_resolved: '🛡️',
  circle_post:     '🔒',
  reaction:        '🙏',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function NotificationBell() {
  const { data: session } = useSession()
  const [open,          setOpen]          = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const bellRef = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.read).length

  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) setNotifications(await res.json())
    } catch { /* swallow network errors */ }
  }, [session?.user?.id])

  // Fetch on mount + poll every 2 minutes (reduced from 30s to ease DB pressure)
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 120_000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function markRead(id: number) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
  }

  if (!session) return null

  return (
    <div ref={bellRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications() }}
        className="relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-teal-ghost transition-colors"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg className="w-[18px] h-[18px] text-text-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-amber text-charcoal text-[0.58rem] font-bold flex items-center justify-center px-1 leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <div className={`absolute top-full right-0 mt-1.5 w-[340px] bg-white border border-teal-light rounded-[20px] shadow-lift z-50 overflow-hidden
        transition-all duration-200 origin-top-right
        ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-teal-light">
          <h3 className="font-semibold text-[0.9rem] text-charcoal">
            Notifications
            {unread > 0 && (
              <span className="ml-2 text-[0.72rem] font-bold text-amber bg-amber/10 px-1.5 py-0.5 rounded-full">
                {unread} new
              </span>
            )}
          </h3>
          {unread > 0 && (
            <button onClick={markAllRead}
              className="text-[0.75rem] text-teal-mid hover:text-teal-deep font-medium transition-colors">
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[380px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[2rem] mb-2">🔔</p>
              <p className="text-[0.82rem] text-text-xlight">You&apos;re all caught up!</p>
            </div>
          ) : (
            notifications.slice(0, 15).map(n => (
              <div
                key={n.id}
                className={`flex gap-3 px-4 py-3 border-b border-teal-light/30 transition-colors
                  ${!n.read ? 'bg-teal-ghost/25' : 'hover:bg-teal-ghost/10'}`}
              >
                <span className="text-[1.05rem] flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  {n.link ? (
                    <Link
                      href={n.link}
                      onClick={() => { markRead(n.id); setOpen(false) }}
                      className="text-[0.82rem] text-charcoal leading-snug no-underline hover:text-teal-deep transition-colors block"
                    >
                      {n.message}
                    </Link>
                  ) : (
                    <p className="text-[0.82rem] text-charcoal leading-snug">{n.message}</p>
                  )}
                  <p className="text-[0.7rem] text-text-xlight mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <button onClick={() => markRead(n.id)}
                    className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
                    aria-label="Mark as read">
                    <span className="w-2 h-2 rounded-full bg-amber hover:bg-amber-soft transition-colors block" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-teal-light bg-ivory/50">
          <Link href="/notifications" onClick={() => setOpen(false)}
            className="text-[0.8rem] text-teal-mid hover:text-teal-deep font-medium transition-colors no-underline block text-center">
            View all notifications →
          </Link>
        </div>
      </div>
    </div>
  )
}
