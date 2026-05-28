import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kindness Map',
  description:
    'A live world map of kind acts — every dot is a real moment of human kindness.',
}

export default function KindnessMapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
