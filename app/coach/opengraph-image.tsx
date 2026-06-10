import { ImageResponse } from 'next/og'
import { OgTool, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'Calm Coach — AI Wellness Companion — letsthinkpositive'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return new ImageResponse(
    <OgTool
      emoji="🌿"
      label="Calm Coach"
      title="Your AI wellness companion."
      description="Gentle prompts, reflective questions, and encouraging support — any time of day, in your language, without judgment."
      pill="Powered by AI · Always available"
    />,
    { ...OG_SIZE }
  )
}
