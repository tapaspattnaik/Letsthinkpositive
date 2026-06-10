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

const OnboardingModal = dynamic(
  () => import('@/components/onboarding/OnboardingModal').then(m => ({ default: m.OnboardingModal })),
  { ssr: false, loading: () => null }
)

const AffirmationCard = dynamic(
  () => import('./AffirmationCard').then(m => ({ default: m.AffirmationCard })),
  { ssr: false, loading: () => null }
)

export function PersonalisedSection() {
  return (
    <>
      <OnboardingModal />
      <AffirmationCard />
      <FavouriteToolsBar />
      <InsightCard />
      <DailyRecipe />
    </>
  )
}
