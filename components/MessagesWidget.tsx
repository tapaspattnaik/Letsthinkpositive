'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

interface Convo {
  userId:      number
  name:        string
  avatar:      string | null
  lastMessage: string
  lastAt:      string
  unread:      number
  online?:     boolean
}
interface Msg {
  id:        number
  fromMe:    boolean
  body:      string
  createdAt: string
  readAt:    string | null
}
interface OtherUser {
  id:     number
  name:   string
  avatar: string | null
}

// Dispatch this event from anywhere to open DM with a specific user
export function openDM(userId: number, name: string, avatar?: string | null) {
  window.dispatchEvent(new CustomEvent('ltp:openDM', { detail: { userId, name, avatar } }))
}

function fmt(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMin = (now.getTime() - d.getTime()) / 60000
  if (diffMin < 1)    return 'just now'
  if (diffMin < 60)   return `${Math.floor(diffMin)}m`
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function Avatar({ src, name, size = 36, online }: { src?: string | null; name: string; size?: number; online?: boolean }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {src
        ? <Image src={src} alt={name} width={size} height={size} className="rounded-full object-cover w-full h-full" />
        : <div className="rounded-full bg-teal-ghost flex items-center justify-center text-teal-deep font-bold"
            style={{ width: size, height: size, fontSize: size * 0.38 }}>
            {initials}
          </div>
      }
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${online ? 'bg-green-400' : 'bg-slate-300'}`} />
      )}
    </div>
  )
}

export function MessagesWidget() {
  const { data: session, status } = useSession()
  const myId = session?.user?.id ? Number(session.user.id) : null

  const [open,     setOpen]     = useState(false)
  const [view,     setView]     = useState<'list' | 'chat'>('list')
  const [convos,   setConvos]   = useState<Convo[]>([])
  const [online,   setOnline]   = useState<Record<number, boolean>>({})
  const [other,    setOther]    = useState<OtherUser | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [draft,    setDraft]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [notified, setNotified] = useState(false)

  const bottomRef     = useRef<HTMLDivElement>(null)
  const inputRef      = useRef<HTMLTextAreaElement>(null)
  const pollRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const presRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevUnreadRef = useRef<number>(0)          // track conversation-level new messages
  const knownMsgIds   = useRef<Set<number>>(new Set()) // track chat-level new messages

  // ── Browser notification helpers ────────────────────────────────────────
  const requestNotifPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'default') await Notification.requestPermission()
  }, [])

  const notify = useCallback((title: string, body: string) => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return
    if (!document.hidden) return          // skip if tab is already focused
    const n = new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      tag:  'ltp-dm',                     // collapses rapid-fire into one alert
    })
    n.onclick = () => { window.focus(); n.close() }
  }, [])

  // ── Presence ping ───────────────────────────────────────────────────────
  const pingPresence = useCallback(async () => {
    if (!myId) return
    await fetch('/api/presence', { method: 'POST' }).catch(() => {})
  }, [myId])

  useEffect(() => {
    if (!myId) return
    pingPresence()
    presRef.current = setInterval(pingPresence, 90_000)
    return () => { if (presRef.current) clearInterval(presRef.current) }
  }, [myId, pingPresence])

  // ── Fetch online status for a set of user IDs ───────────────────────────
  const fetchOnline = useCallback(async (ids: number[]) => {
    if (!ids.length) return
    const res = await fetch(`/api/presence?ids=${ids.join(',')}`)
    if (res.ok) setOnline(await res.json())
  }, [])

  // ── Load conversations ──────────────────────────────────────────────────
  const loadConvos = useCallback(async () => {
    const res = await fetch('/api/dm/conversations')
    if (!res.ok) return
    const data: Convo[] = await res.json()

    // Browser notification when unread count goes up
    const newTotal = data.reduce((s, c) => s + c.unread, 0)
    if (newTotal > prevUnreadRef.current) {
      // Find the conversation that gained unread messages
      setConvos(prev => {
        const newConvo = data.find(c => {
          const old = prev.find(x => x.userId === c.userId)
          return c.unread > (old?.unread ?? 0)
        })
        if (newConvo) notify(`💬 ${newConvo.name}`, newConvo.lastMessage)
        return data
      })
    } else {
      setConvos(data)
    }
    prevUnreadRef.current = newTotal
    if (data.length) fetchOnline(data.map(c => c.userId))
  }, [fetchOnline, notify])

  // ── Load messages for a chat ────────────────────────────────────────────
  const loadMessages = useCallback(async (userId: number) => {
    const res = await fetch(`/api/dm/${userId}`)
    if (!res.ok) return
    const data = await res.json() as { other: OtherUser; messages: Msg[] }

    // Browser notification for new inbound messages in open chat
    const newInbound = data.messages.filter(m => !m.fromMe && !knownMsgIds.current.has(m.id))
    data.messages.forEach(m => knownMsgIds.current.add(m.id))
    if (newInbound.length > 0) {
      notify(`💬 ${data.other.name}`, newInbound[newInbound.length - 1].body)
    }

    setOther(data.other)
    setMessages(data.messages)
    fetch(`/api/dm/${userId}/read`, { method: 'PATCH' }).catch(() => {})
  }, [notify])

  // ── Polling ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !myId) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
      return
    }
    if (view === 'list') {
      loadConvos()
      pollRef.current = setInterval(loadConvos, 12_000)
    } else if (view === 'chat' && other) {
      const poll = () => loadMessages(other.id)
      poll()
      pollRef.current = setInterval(poll, 8_000)
    }
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }
  }, [open, view, other?.id, myId, loadConvos, loadMessages]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // ── Unread badge (shows on closed bubble) ───────────────────────────────
  const totalUnread = convos.reduce((s, c) => s + c.unread, 0)

  // Pulse once when new unread arrives while widget is closed
  useEffect(() => {
    if (!open && totalUnread > 0) setNotified(true)
    else setNotified(false)
  }, [totalUnread, open])

  // ── Listen for openDM events from profile/search ─────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { userId, name, avatar } = (e as CustomEvent).detail as { userId: number; name: string; avatar?: string }
      setOther({ id: userId, name, avatar: avatar ?? null })
      setView('chat')
      setOpen(true)
      setLoadingChat(true)
      loadMessages(userId).finally(() => setLoadingChat(false))
      fetchOnline([userId])
    }
    window.addEventListener('ltp:openDM', handler)
    return () => window.removeEventListener('ltp:openDM', handler)
  }, [loadMessages, fetchOnline])

  // ── Open to list ─────────────────────────────────────────────────────────
  const openList = useCallback(() => {
    setView('list')
    setOpen(true)
    loadConvos()
    requestNotifPermission()   // ask once, on first widget open
  }, [loadConvos, requestNotifPermission])

  // ── Open chat from list ──────────────────────────────────────────────────
  const openChat = useCallback((c: Convo) => {
    setOther({ id: c.userId, name: c.name, avatar: c.avatar })
    setView('chat')
    setLoadingChat(true)
    loadMessages(c.userId).finally(() => setLoadingChat(false))
    fetchOnline([c.userId])
    // clear local unread
    setConvos(prev => prev.map(x => x.userId === c.userId ? { ...x, unread: 0 } : x))
  }, [loadMessages, fetchOnline])

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!draft.trim() || !other || sending) return
    setSending(true)
    const text = draft.trim()
    setDraft('')
    const res = await fetch(`/api/dm/${other.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text }),
    })
    if (res.ok) {
      const msg: Msg = await res.json()
      setMessages(prev => [...prev, msg])
    }
    setSending(false)
    inputRef.current?.focus()
  }, [draft, other, sending])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  if (status !== 'authenticated' || !myId) return null

  return (
    <div className="fixed bottom-[76px] lg:bottom-5 right-[76px] z-[998] flex flex-col items-end">
      {/* ── Panel ────────────────────────────────────────────────────────── */}
      {open && (
        <div className="absolute bottom-14 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ maxHeight: 'min(480px, calc(100dvh - 180px))' }}>

          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 bg-teal-deep text-white rounded-t-2xl">
            {view === 'chat' && (
              <button onClick={() => setView('list')} className="p-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0" aria-label="Back">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              </button>
            )}
            {view === 'chat' && other
              ? <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <Avatar src={other.avatar} name={other.name} size={28} />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-teal-deep ${online[other.id] ? 'bg-green-400' : 'bg-slate-300'}`} />
                  </div>
                  <div className="min-w-0">
                    <Link href={`/profile/${other.id}`} className="font-semibold text-sm text-white hover:underline truncate block">{other.name}</Link>
                    <p className="text-[0.65rem] text-teal-200">{online[other.id] ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
              : <span className="font-semibold text-sm flex-1">Messages</span>
            }
            <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0 ml-auto" aria-label="Close">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* ── Conversation List ── */}
            {view === 'list' && (
              <div>
                {convos.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-2xl mb-2">💬</p>
                    <p className="text-[0.8rem] text-slate-500 font-medium">No messages yet</p>
                    <p className="text-[0.72rem] text-slate-400 mt-1">Find people on <Link href="/community" className="text-teal-deep hover:underline">Community</Link> or <Link href="/search" className="text-teal-deep hover:underline">Search</Link></p>
                  </div>
                )}
                {convos.map(c => (
                  <button key={c.userId} onClick={() => openChat(c)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left">
                    <Avatar src={c.avatar} name={c.name} size={38} online={online[c.userId]} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className={`text-[0.82rem] truncate ${c.unread > 0 ? 'font-bold text-charcoal' : 'font-medium text-slate-700'}`}>{c.name}</span>
                        <span className="text-[0.65rem] text-slate-400 flex-shrink-0">{fmt(c.lastAt)}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <p className={`text-[0.72rem] truncate flex-1 ${c.unread > 0 ? 'text-charcoal font-medium' : 'text-slate-400'}`}>{c.lastMessage}</p>
                        {c.unread > 0 && (
                          <span className="flex-shrink-0 bg-teal-deep text-white text-[0.6rem] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">{c.unread}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ── Chat view ── */}
            {view === 'chat' && (
              <div className="flex flex-col gap-1 px-3 py-2 min-h-full">
                {loadingChat && (
                  <div className="flex justify-center py-6">
                    <span className="w-5 h-5 border-2 border-teal-deep border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!loadingChat && messages.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-xl mb-1">👋</p>
                    <p className="text-[0.75rem] text-slate-400">Say hello to {other?.name}!</p>
                  </div>
                )}
                {messages.map((m, i) => {
                  const showTime = i === 0 || (new Date(m.createdAt).getTime() - new Date(messages[i - 1].createdAt).getTime() > 5 * 60 * 1000)
                  return (
                    <div key={m.id}>
                      {showTime && (
                        <p className="text-center text-[0.6rem] text-slate-400 my-1.5">{fmt(m.createdAt)}</p>
                      )}
                      <div className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-3 py-1.5 rounded-2xl text-[0.78rem] leading-relaxed break-words whitespace-pre-wrap
                          ${m.fromMe
                            ? 'bg-teal-deep text-white rounded-br-md'
                            : 'bg-slate-100 text-slate-800 rounded-bl-md'
                          }`}>
                          {m.body}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          {view === 'chat' && (
            <div className="border-t border-slate-100 px-2 py-2 flex items-end gap-1.5">
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={handleKey}
                placeholder={`Message ${other?.name ?? ''}…`}
                className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-1.5 text-[0.78rem] focus:outline-none focus:border-teal-mid max-h-24 overflow-y-auto"
                style={{ lineHeight: '1.4' }}
              />
              <button
                onClick={sendMessage}
                disabled={!draft.trim() || sending}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-deep text-white flex items-center justify-center hover:bg-teal-700 transition-colors disabled:opacity-40"
                aria-label="Send">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Bubble button ──────────────────────────────────────────────────── */}
      <button
        onClick={() => open ? setOpen(false) : openList()}
        className={`relative w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all
          ${open ? 'bg-teal-700 scale-95' : 'bg-teal-deep hover:scale-105 hover:shadow-xl'}
          ${notified ? 'animate-bounce' : ''}`}
        aria-label={open ? 'Close messages' : 'Open messages'}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        {totalUnread > 0 && !open && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.58rem] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>
    </div>
  )
}
