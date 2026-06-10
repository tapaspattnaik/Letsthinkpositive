'use client'

// Client wrapper — holds personalised components that need useSession + client-only APIs.
// dynamic({ ssr: false }) is only allowed in Client Components, not Server Components.

import dynamic from 'next/dynamic'

const FavouriteToolsBar = dynamic(
  () => import('./FavouriteToolsBar').then(m => ({ default: m.FavouriteToolsBar })),
  { ssr: false, loading: () => null }
)

const DailyRecipe = dynamic(
  () => import('./DailyRecipe').then(m => ({ default: m.DailyRecipe })),
  { ssr: false, loading: () => null }
)

const InsightCard = dynamic(
  () => import('./InsightCard').then(m => ({ default: m.InsightCard })),
  { ssr: false, loading: () => null }
)

export function PersonalisedSection() {
  return (
    <>
      <FavouriteToolsBar />
      <InsightCard />
      <DailyRecipe />
    </>
  )
}
