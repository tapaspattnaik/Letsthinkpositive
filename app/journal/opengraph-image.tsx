import { ImageResponse } from 'next/og'
import { OgTool, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'Gratitude Journal — letsthinkpositive'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return new ImageResponse(
    <OgTool
      emoji="📓"
      label="Gratitude Journal"
      title="A private space to write."
      description="Daily prompts, mood tracking, and a calming space to write what you're grateful for. Your thoughts, safely yours."
      pill="Private · Streaks · Mood tracking"
    />,
    { ...OG_SIZE }
  )
}
