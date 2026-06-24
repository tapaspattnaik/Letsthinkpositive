'use client'

import dynamic from 'next/dynamic'

const MessagesWidget = dynamic(
  () => import('@/components/MessagesWidget').then(m => ({ default: m.MessagesWidget })),
  { ssr: false, loading: () => null }
)

export function MessagesWidgetLazy() {
  return <MessagesWidget />
}
