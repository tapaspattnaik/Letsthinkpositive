import { ImageResponse } from 'next/og'
import { getArticle } from '@/lib/library'
import { OgArticle, OgDefault, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'Wellness Library — letsthinkpositive'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    return new ImageResponse(
      <OgDefault tagline="Evidence-backed wellness articles" pills={['Mindfulness', 'Sleep', 'Anxiety', 'Gratitude']} />,
      { ...OG_SIZE }
    )
  }

  return new ImageResponse(
    <OgArticle
      badgeEmoji="📚"
      badge="Wellness Library"
      title={article.title}
      excerpt={article.excerpt}
      author={`By ${article.author}`}
      meta={`${article.readTime} min · ${article.category}`}
    />,
    { ...OG_SIZE }
  )
}
