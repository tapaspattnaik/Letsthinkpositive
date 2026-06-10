import { ImageResponse } from 'next/og'
import { OgDefault, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'letsthinkpositive — where every thought begins with hope'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return new ImageResponse(<OgDefault />, { ...OG_SIZE })
}
