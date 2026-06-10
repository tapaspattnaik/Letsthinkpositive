import { ImageResponse } from 'next/og'
import { OgTool, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'Guided Meditation — letsthinkpositive'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return new ImageResponse(
    <OgTool
      emoji="🧘"
      label="Guided Meditation"
      title="Close your eyes. Begin."
      description="Sessions for sleep, anxiety, focus, and morning calm. From 5 to 30 minutes — wherever you are, whenever you need it."
      pill="Free · No sign-up needed"
    />,
    { ...OG_SIZE }
  )
}
