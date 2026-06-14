import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/sounds' },
  title: 'Calm Sounds',
  description: 'Relax with procedurally generated ambient sounds — rain, ocean waves, forest, fire, and more. No downloads, no ads. Pure calm, straight from your browser.',
  openGraph: {
    title: 'Calm Sounds — letsthinkpositive',
    description: 'Stream soothing ambient soundscapes generated in real time: rain, ocean, forest, white noise and more — to focus, relax, or fall asleep.',
  },
}

export default function SoundsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
