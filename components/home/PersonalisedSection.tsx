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

const TimeOfDayCard = dynamic(
  () => import('./TimeOfDayCard').then(m => ({ default: m.TimeOfDayCard })),
  { ssr: false, loading: () => null }
)

const GentleBanner = dynamic(
  () => import('@/components/GentleBanner').then(m => ({ default: m.GentleBanner })),
  { ssr: false, loading: () => null }
)

const OnThisDayCard = dynamic(
  () => import('./OnThisDayCard').then(m => ({ default: m.OnThisDayCard })),
  { ssr: false, loading: () => null }
)

export function PersonalisedSection() {
  return (
    <>
      <OnboardingModal />
      <GentleBanner />
      <TimeOfDayCard />
      <AffirmationCard />
      <FavouriteToolsBar />
      <InsightCard />
      <OnThisDayCard />
      <DailyRecipe />
    </>
  )
}
