import { NextResponse } from 'next/server'

interface FbPost {
  id: string; message?: string; story?: string; full_picture?: string
  created_time: string; permalink_url: string
}
interface IgPost {
  id: string; caption?: string; media_url: string; thumbnail_url?: string
  media_type: string; timestamp: string; permalink: string
}

// Helper — fetch with a hard timeout so a slow/hung Facebook API never
// blocks the server process on Hostinger shared hosting.
function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, {
    signal: controller.signal,
    next:   { revalidate: 3600 },
  }).finally(() => clearTimeout(id))
}

export const revalidate = 3600  // cache the response for 1 hour

export async function GET() {
  const pageId    = process.env.FB_PAGE_ID
  const pageToken = process.env.FB_PAGE_ACCESS_TOKEN
  const igUserId  = process.env.IG_USER_ID

  if (!pageToken || !pageId || !igUserId) {
    return NextResponse.json({ fb: [], ig: [], configured: false })
  }

  const results = await Promise.allSettled([
    fetchWithTimeout(
      `https://graph.facebook.com/v20.0/${pageId}/posts?fields=message,story,full_picture,created_time,permalink_url&limit=6&access_token=${pageToken}`,
      5000
    ).then(r => r.json()),

    fetchWithTimeout(
      `https://graph.facebook.com/v20.0/${igUserId}/media?fields=id,caption,media_url,thumbnail_url,media_type,timestamp,permalink&limit=6&access_token=${pageToken}`,
      5000
    ).then(r => r.json()),
  ])

  const fbData = results[0].status === 'fulfilled' ? results[0].value : { data: [] }
  const igData = results[1].status === 'fulfilled' ? results[1].value : { data: [] }

  const fb: FbPost[] = (fbData.data ?? []).filter((p: FbPost) => p.message || p.story)
  const ig: IgPost[] = (igData.data ?? []).filter((p: IgPost) => p.media_type !== 'VIDEO' || p.thumbnail_url)

  return NextResponse.json({ fb, ig, configured: true })
}
