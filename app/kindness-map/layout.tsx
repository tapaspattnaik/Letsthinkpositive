import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/kindness-map' },
  title: 'Kindness Map',
  description:
    'A live world map of kind acts — every dot is a real moment of human kindness.',
}

export default function KindnessMapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
