import type { Metadata } from 'next'
import { prisma } from '@/lib/db'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const circle = await prisma.circle.findUnique({
      where:  { slug },
      select: { name: true, description: true },
    })
    if (!circle) return { title: 'Circle' }
    return {
      title: circle.name,
      description: circle.description
        ? `${circle.description.slice(0, 155)}${circle.description.length > 155 ? '…' : ''}`
        : `Join the ${circle.name} circle on letsthinkpositive and connect with a supportive community.`,
      alternates: { canonical: `/circles/${slug}` },
      openGraph: {
        title: `${circle.name} — letsthinkpositive`,
        description: circle.description ?? `A private wellness circle on letsthinkpositive.`,
      },
    }
  } catch {
    return { title: 'Circle' }
  }
}

export default function CircleSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
