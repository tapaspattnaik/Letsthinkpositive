import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Write for Us',
  description: 'Share your wellness story, insights, or experience with the letsthinkpositive community. Submit your article and inspire others on their journey.',
  openGraph: {
    title: 'Write for Us — letsthinkpositive',
    description: 'Have a story, tip, or insight to share? Submit a blog post to the letsthinkpositive community and help others on their wellness journey.',
  },
}

export default function BlogSubmitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
