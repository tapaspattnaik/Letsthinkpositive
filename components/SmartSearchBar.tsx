'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Result {
  id: string; href: string; title: string; icon: string
}

export function SmartSearchBar() {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [note,    setNote]    = useState('')
  const [loading, setLoading] = useState(false)
  const [open,    setOpen]    = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function search(q: string) {
    if (!q.trim()) { setResults([]); setNote(''); setOpen(false); return }
    setLoading(true); setOpen(true)
    fetch('/api/smart-search', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) { setResults(d.results ?? []); setNote(d.note ?? '') }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { if (timer.current) clearTimeout(timer.current); search(query) }
    if (e.key === 'Escape') { setOpen(false) }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (timer.current) clearTimeout(timer.current)
    if (val.trim().length >= 3) {
      timer.current = setTimeout(() => search(val), 600)
    } else {
      setResults([]); setOpen(false)
    }
  }

  function go(href: string) {
    setOpen(false); setQuery(''); setResults([])
    router.push(href)
  }

  return (
    <div ref={wrapRef} className="relative w-full max-w-xl mx-auto">
      <div className="flex items-center gap-3 bg-white border-2 border-teal-light rounded-full px-5 py-3 shadow-card focus-within:border-teal-mid transition-colors">
        <span className="text-teal-mid text-[1.1rem] flex-shrink-0">
          {loading ? (
            <svg className="w-5 h-5 animate-spin text-teal-mid" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : '🔍'}
        </span>
        <input
          type="text"
          value={query}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => { if (results.length) setOpen(true) }}
          placeholder="How are you feeling? Type anything…"
          aria-label="Search by how you feel"
          className="flex-1 bg-transparent outline-none text-[0.97rem] text-charcoal placeholder:text-text-xlight"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
            aria-label="Clear search"
            className="text-text-xlight hover:text-charcoal text-xl leading-none flex-shrink-0 w-6 h-6 flex items-center justify-center">×</button>
        )}
      </div>

      {/* Dropdown */}
      {open && (results.length > 0 || note) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[20px] shadow-lift border border-teal-light overflow-hidden z-50">
          {note && (
            <p className="px-5 pt-4 pb-2 text-[0.82rem] text-teal-deep font-medium italic">{note}</p>
          )}
          <div className="divide-y divide-teal-light/40">
            {results.map(r => (
              <button key={r.id} onClick={() => go(r.href)}
                className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-teal-ghost transition-colors group">
                <span className="text-[1.4rem] flex-shrink-0">{r.icon}</span>
                <span className="text-[0.93rem] font-semibold text-charcoal group-hover:text-teal-deep transition-colors">
                  {r.title}
                </span>
                <span className="ml-auto text-teal-mid opacity-0 group-hover:opacity-100 transition-opacity text-[0.8rem]">→</span>
              </button>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-teal-light/40 bg-teal-ghost/40">
            <p className="text-[0.72rem] text-text-xlight">Tip: describe how you feel in your own words — Bit will find the right tool.</p>
          </div>
        </div>
      )}
    </div>
  )
}
