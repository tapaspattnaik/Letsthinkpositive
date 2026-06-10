import { ImageResponse } from 'next/og'
import { OgTool, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'About Tapas Pattanaik — letsthinkpositive'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return new ImageResponse(
    <OgTool
      emoji="👋"
      label="Meet the Founder"
      title="The mind behind this."
      description="Tapas Pattanaik — IT professional, mindset explorer, and the person who stopped waiting for a Superman and decided to be a SuperbMan instead."
    />,
    { ...OG_SIZE }
  )
}
