'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// ── Floating return pill on tool pages ──────────────────────────────────────
// Tool pages are destinations with no obvious way back to the user's home
// base. Desktop-only (mobile has the BottomNav), signed-in only, and only on
// tool routes — everywhere else it renders nothing.

const TOOL_PREFIXES = [
  '/mood', '/journal', '/sleep', '/water', '/calendar', '/snapshot',
  '/intention', '/habits', '/habits-lab', '/breathing', '/meditation',
  '/sounds', '/coach', '/yoga', '/reframe', '/challenges',
  '/wisdom-coaching', '/quiz', '/affirmation', '/quotes', '/vision-board',
  '/drawing', '/positive-eating', '/happy-foods', '/kids', '/gratitude-wall',
  '/kindness-map', '/rewards', '/wrapped', '/assessments', '/bit-chat',
  '/library', '/tools',
]

export function ToolBreadcrumb() {
  const pathname  = usePathname()
  const router    = useRouter()
  const { status } = useSession()

  if (status !== 'authenticated') return null

  const isToolPage = TOOL_PREFIXES.some(p => pathname === p || pathname.startsWith(`${p}/`))
  if (!isToolPage) return null

  return (
    <div className="hidden sm:flex fixed top-[84px] left-4 z-40 items-center gap-2">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-text-mid hover:text-charcoal text-[0.78rem] font-semibold px-3.5 py-2 rounded-full shadow-card border border-teal-light/60 hover:border-teal-mid hover:shadow-lift transition-all">
        ← Back
      </button>
      <Link href="/profile"
        className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-teal-deep hover:text-teal-dark text-[0.78rem] font-semibold px-3.5 py-2 rounded-full shadow-card border border-teal-light/60 hover:border-teal-mid hover:shadow-lift transition-all no-underline">
        🌿 My Space
      </Link>
    </div>
  )
}
