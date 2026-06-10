import { ImageResponse } from 'next/og'
import { getPost } from '@/lib/posts'
import { OgArticle, OgDefault, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'Blog post — letsthinkpositive'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return new ImageResponse(
      <OgDefault tagline="Stories, insights & inspiration" pills={['Blog', 'Stories', 'Insights']} />,
      { ...OG_SIZE }
    )
  }

  return new ImageResponse(
    <OgArticle
      badgeEmoji="✍️"
      badge="Blog"
      title={post.title}
      excerpt={post.excerpt}
      author={`By ${post.author}`}
      meta={post.tag}
    />,
    { ...OG_SIZE }
  )
}
