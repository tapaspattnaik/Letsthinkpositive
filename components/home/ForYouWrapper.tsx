'use client'
import dynamic from 'next/dynamic'

const ForYouSection = dynamic(
  () => import('./ForYouSection').then(m => ({ default: m.ForYouSection })),
  { ssr: false, loading: () => null }
)

export function ForYouWrapper() {
  return <ForYouSection />
}
