import { ImageResponse } from 'next/og'
import { OgTool, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'Wellness Challenges — letsthinkpositive'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return new ImageResponse(
    <OgTool
      emoji="🏆"
      label="Wellness Challenges"
      title="Build habits that last."
      description="7, 21, and 30-day programmes to build gratitude, movement, sleep, and mindfulness habits — one day at a time."
      pill="Track streaks · Join thousands"
    />,
    { ...OG_SIZE }
  )
}
