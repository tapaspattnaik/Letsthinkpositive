'use client'

import dynamic from 'next/dynamic'

// Defer the Bit chat widget — it's a floating, below-the-fold button that
// users rarely open on first paint. Loading it client-side after hydration
// keeps its JS (and the chat hook) off the critical path on every page.
const BitWidget = dynamic(
  () => import('@/components/BitWidget').then(m => ({ default: m.BitWidget })),
  { ssr: false, loading: () => null }
)

export function BitWidgetLazy() {
  return <BitWidget />
}
