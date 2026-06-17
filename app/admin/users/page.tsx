'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface AdminUser {
  id: number; name: string; email: string; role: string
  blocked: boolean; blockedReason?: string; blockedAt?: string
  avatarUrl?: string; createdAt: string; lastLoginAt?: string
  currentStreak: number; reportsAgainst: number
  _count: { blogSubmissions: number; posts: number; reports: number }
}

interface Stats { totalUsers: number; blockedCount: number; pendingReports: number; newThisWeek: number }

type Filter = 'all' | 'blocked' | 'reported' | 'admin'

function timeAgo(d?: string) {
  if (!d) return 'Never'
  const diff = Date.now() - new Date(d).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 2)    return 'Just now'
  if (hours < 1)   return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days < 30)   return `${days}d ago`
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' })
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    admin:     'bg-purple-100 text-purple-700 border-purple-200',
    moderator: 'bg-blue-100 text-blue-700 border-blue-200',
    user:      'bg-gray-100 text-gray-500 border-gray-200',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full border text-[0.68rem] font-bold uppercase tracking-wide ${map[role] ?? map.user}`}>
      {role}
    </span>
  )
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [users,   setUsers]   = useState<AdminUser[]>([])
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState<Filter>('all')
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)

  const [selected, setSelected]   = useState<AdminUser | null>(null)
  const [actionModal, setModal]   = useState<'block' | 'unblock' | 'role' | 'reset' | 'password' | null>(null)
  const [actionReason, setReason] = useState('')
  const [actionRole,   setRole]   = useState('user')
  const [newPassword,  setNewPwd] = useState('')
  const [working,      setWorking]= useState(false)
  const [toast,        setToast]  = useState('')

  // Server is the source of truth for admin status (DB role or env email) —
  // a 403 from the API redirects away; success authorizes the page.
  const [isAdmin, setIsAdmin] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ search, filter, page: String(page) })
      const res  = await fetch(`/api/admin/users?${params}`)
      if (res.status === 403) { router.replace('/'); return }
      setIsAdmin(true)
      const data = await res.json()
      setUsers(data.users ?? [])
      setTotal(data.total ?? 0)
      setStats(data.stats ?? null)
    } finally {
      setLoading(false)
    }
  }, [search, filter, page, router])

  useEffect(() => { if (session) load() }, [session, load])

  async function doAction() {
    if (!selected || !actionModal) return
    setWorking(true)
    try {
      const body: Record<string, unknown> = { action: actionModal === 'block' ? 'block' : actionModal === 'unblock' ? 'unblock' : actionModal === 'role' ? 'set_role' : actionModal === 'reset' ? 'send_reset' : 'set_password' }
      if (actionModal === 'block')    body.reason = actionReason
      if (actionModal === 'role')     body.role   = actionRole
      if (actionModal === 'password') body.newPassword = newPassword

      const res = await fetch(`/api/admin/users/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()

      if (data.success) {
        setToast(`✅ ${actionModal === 'block' ? 'User blocked' : actionModal === 'unblock' ? 'User unblocked' : actionModal === 'role' ? 'Role updated' : actionModal === 'reset' ? 'Password reset email sent' : 'Password updated'}`)
        setModal(null); setReason(''); setNewPwd('')
        load()
      } else {
        setToast(`❌ ${data.error ?? 'Action failed'}`)
      }
    } finally {
      setWorking(false)
      setTimeout(() => setToast(''), 3000)
    }
  }

  if (!isAdmin) return null

  const perPage = 20
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-charcoal text-white px-4 py-3 rounded-2xl shadow-lift text-[0.86rem] font-medium animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-[1.8rem] font-bold text-charcoal">User Management</h1>
          <p className="text-text-xlight text-[0.85rem] mt-0.5">Control access, roles and safety across the platform</p>
        </div>
        <button onClick={() => router.push('/admin')}
          className="text-[0.82rem] text-teal-deep border border-teal-light hover:bg-teal-ghost px-4 py-2 rounded-full transition-colors">
          ← Back to Admin
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users',     value: stats.totalUsers,     icon: '👥', color: 'bg-teal-ghost border-teal-light' },
            { label: 'New This Week',   value: stats.newThisWeek,    icon: '🆕', color: 'bg-green-50 border-green-200' },
            { label: 'Blocked',         value: stats.blockedCount,   icon: '🚫', color: 'bg-red-50 border-red-200' },
            { label: 'Pending Reports', value: stats.pendingReports, icon: '⚠️', color: 'bg-amber-50 border-amber-200' },
          ].map(s => (
            <div key={s.label} className={`${s.color} border rounded-2xl p-5`}>
              <div className="text-[1.8rem] mb-1">{s.icon}</div>
              <div className="font-display font-bold text-[1.8rem] text-charcoal leading-none">{s.value}</div>
              <div className="text-[0.75rem] text-text-xlight mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex-1 min-w-[200px] relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-xlight" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-[0.88rem] outline-none focus:border-teal-mid bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'blocked', 'reported', 'admin'] as Filter[]).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1) }}
              className={`px-3.5 py-2 rounded-full text-[0.78rem] font-medium border transition-all capitalize
                ${filter === f ? 'bg-teal-deep text-white border-teal-deep' : 'bg-white text-text-mid border-gray-200 hover:border-teal-mid'}`}>
              {f === 'reported' ? '⚠️ Reported' : f === 'blocked' ? '🚫 Blocked' : f === 'admin' ? '🛡️ Staff' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['User', 'Role', 'Status', 'Joined', 'Last Login', 'Activity', 'Reports', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[0.72rem] font-bold text-text-xlight uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-text-xlight">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-text-xlight">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className={`hover:bg-gray-50/60 transition-colors ${u.blocked ? 'bg-red-50/30' : ''}`}>
                  {/* User — links to their public profile */}
                  <td className="px-4 py-3">
                    <Link href={`/profile/${u.id}`} target="_blank" rel="noopener"
                      title="View public profile"
                      className="flex items-center gap-3 no-underline group/user">
                      {u.avatarUrl ? (
                        <Image src={u.avatarUrl} alt={u.name} width={36} height={36} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-mid to-teal-deep flex items-center justify-center text-white font-bold text-[0.9rem] flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[0.85rem] text-charcoal leading-none group-hover/user:text-teal-deep group-hover/user:underline transition-colors">
                          {u.name} <span className="opacity-0 group-hover/user:opacity-100 text-teal-mid text-[0.7rem] transition-opacity">↗</span>
                        </p>
                        <p className="text-[0.72rem] text-text-xlight mt-0.5">{u.email}</p>
                      </div>
                    </Link>
                  </td>
                  {/* Role */}
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    {u.blocked ? (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[0.72rem] font-bold px-2.5 py-0.5 rounded-full">
                        🚫 Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[0.72rem] font-bold px-2.5 py-0.5 rounded-full">
                        ✅ Active
                      </span>
                    )}
                  </td>
                  {/* Joined */}
                  <td className="px-4 py-3 text-[0.78rem] text-text-mid whitespace-nowrap">{timeAgo(u.createdAt)}</td>
                  {/* Last Login */}
                  <td className="px-4 py-3 text-[0.78rem] text-text-mid whitespace-nowrap">{timeAgo(u.lastLoginAt)}</td>
                  {/* Activity */}
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-[0.72rem] text-text-xlight">
                      <span>📝 {u._count.blogSubmissions}</span>
                      <span>💬 {u._count.posts}</span>
                      {u.currentStreak > 0 && <span>🔥 {u.currentStreak}d</span>}
                    </div>
                  </td>
                  {/* Reports against */}
                  <td className="px-4 py-3">
                    {u.reportsAgainst > 0 ? (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[0.72rem] font-bold px-2.5 py-1 rounded-full">
                        ⚠️ {u.reportsAgainst} report{u.reportsAgainst !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-[0.72rem] text-text-xlight">—</span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {/* Role */}
                      <button onClick={() => { setSelected(u); setRole(u.role); setModal('role') }}
                        title="Change role"
                        className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center transition-colors text-[0.8rem]">
                        🛡️
                      </button>
                      {/* Reset password */}
                      <button onClick={() => { setSelected(u); setModal('reset') }}
                        title="Send password reset email"
                        className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors text-[0.8rem]">
                        🔑
                      </button>
                      {/* Block / Unblock */}
                      {u.blocked ? (
                        <button onClick={() => { setSelected(u); setModal('unblock') }}
                          title="Unblock user"
                          className="w-7 h-7 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors text-[0.8rem]">
                          ✅
                        </button>
                      ) : (
                        <button onClick={() => { setSelected(u); setModal('block') }}
                          title="Block user"
                          className="w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors text-[0.8rem]">
                          🚫
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-[0.78rem] text-text-xlight">
              Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, total)} of {total} users
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-[0.78rem] font-medium text-text-mid hover:bg-white disabled:opacity-40 transition-colors">
                ← Prev
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-[0.78rem] font-medium text-text-mid hover:bg-white disabled:opacity-40 transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Action Modals ─────────────────────────────────────────── */}
      {actionModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-lift w-full max-w-md p-6 animate-fade-in">

            {/* Block */}
            {actionModal === 'block' && (
              <>
                <h3 className="font-display font-bold text-[1.2rem] text-charcoal mb-1">Block {selected.name}</h3>
                <p className="text-text-xlight text-[0.82rem] mb-4">The user will be prevented from logging in and will be notified.</p>
                <label className="block text-[0.78rem] font-semibold text-teal-deep mb-1.5">Reason (optional)</label>
                <textarea value={actionReason} onChange={e => setReason(e.target.value)} rows={3}
                  placeholder="e.g. Repeated community guideline violations"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[0.88rem] outline-none focus:border-teal-mid resize-none bg-gray-50 mb-4" />
              </>
            )}

            {/* Unblock */}
            {actionModal === 'unblock' && (
              <>
                <h3 className="font-display font-bold text-[1.2rem] text-charcoal mb-1">Unblock {selected.name}</h3>
                <p className="text-text-mid text-[0.85rem] mb-4">
                  {selected.blockedReason && <span>Blocked for: <em>{selected.blockedReason}</em><br /></span>}
                  The user will be reinstated and notified.
                </p>
              </>
            )}

            {/* Change Role */}
            {actionModal === 'role' && (
              <>
                <h3 className="font-display font-bold text-[1.2rem] text-charcoal mb-1">Change Role</h3>
                <p className="text-text-xlight text-[0.82rem] mb-4">{selected.name} — current role: <strong>{selected.role}</strong></p>
                <div className="space-y-2 mb-4">
                  {[
                    { value: 'user',      label: 'User',       desc: 'Standard access' },
                    { value: 'moderator', label: 'Moderator',  desc: 'Can approve posts and resolve reports' },
                    { value: 'admin',     label: 'Admin',      desc: 'Full platform access' },
                  ].map(r => (
                    <label key={r.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${actionRole === r.value ? 'border-teal-mid bg-teal-ghost' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" checked={actionRole === r.value} onChange={() => setRole(r.value)} className="accent-teal-deep" />
                      <div>
                        <p className="font-semibold text-[0.86rem] text-charcoal">{r.label}</p>
                        <p className="text-[0.72rem] text-text-xlight">{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* Password Reset Email */}
            {actionModal === 'reset' && (
              <>
                <h3 className="font-display font-bold text-[1.2rem] text-charcoal mb-1">Send Password Reset</h3>
                <p className="text-text-mid text-[0.85rem] mb-4">
                  A password reset link will be emailed to <strong>{selected.email}</strong>. The link expires in 24 hours.
                </p>
              </>
            )}

            {/* Set Password */}
            {actionModal === 'password' && (
              <>
                <h3 className="font-display font-bold text-[1.2rem] text-charcoal mb-1">Set Temporary Password</h3>
                <p className="text-text-xlight text-[0.82rem] mb-4">Set a temporary password for {selected.name}. Ask them to change it after logging in.</p>
                <input type="text" value={newPassword} onChange={e => setNewPwd(e.target.value)}
                  placeholder="New temporary password (min 8 chars)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[0.88rem] outline-none focus:border-teal-mid bg-gray-50 mb-4" />
              </>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setModal(null); setReason(''); setNewPwd('') }}
                className="flex-1 border border-gray-200 text-text-mid py-2.5 rounded-xl text-[0.88rem] font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={doAction} disabled={working}
                className={`flex-1 py-2.5 rounded-xl text-[0.88rem] font-semibold text-white transition-colors disabled:opacity-50
                  ${actionModal === 'block' ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-deep hover:bg-teal-dark'}`}>
                {working ? 'Working…' : actionModal === 'block' ? 'Block User' : actionModal === 'unblock' ? 'Reinstate User' : actionModal === 'role' ? 'Update Role' : actionModal === 'reset' ? 'Send Reset Email' : 'Set Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
