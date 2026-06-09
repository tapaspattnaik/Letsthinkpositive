import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community Gallery',
  description: 'Browse and celebrate creative expressions from the letsthinkpositive community — drawings, vision boards, affirmations, and moments of joy shared by members.',
  openGraph: {
    title: 'Community Gallery — letsthinkpositive',
    description: 'A collection of creative, uplifting artwork and moments shared by community members — drawings, vision boards, affirmations, and more.',
  },
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
