import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vision Board',
  description: 'Create a personal vision board with intention cards. Visualise your goals and manifest the life you want to live.',
}

export default function VisionBoardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
