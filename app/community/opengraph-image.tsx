import { ImageResponse } from 'next/og'
import { OgTool, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'Community — letsthinkpositive'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return new ImageResponse(
    <OgTool
      emoji="💛"
      label="Community"
      title="Real stories. Real people."
      description="Share what's working, what's hard, and what's helping. A space where you're heard — not judged."
      pill="Join the movement"
    />,
    { ...OG_SIZE }
  )
}
