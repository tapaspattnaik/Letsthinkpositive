import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Daily Affirmation Card',
  description:
    'Generate a beautiful personalised affirmation card to share on Instagram, WhatsApp, or keep as your phone wallpaper.',
}

export default function AffirmationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
