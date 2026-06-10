import { ImageResponse } from 'next/og'
import { OgTool, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'Calm Sounds — letsthinkpositive'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return new ImageResponse(
    <OgTool
      emoji="🎧"
      label="Calm Sounds"
      title="Your perfect ambient soundscape."
      description="Layer rain, forest, ocean, and Tibetan bowls. Mix volumes. Find your calm — then save your blend."
      pill="Free · In-browser · No download"
    />,
    { ...OG_SIZE }
  )
}
