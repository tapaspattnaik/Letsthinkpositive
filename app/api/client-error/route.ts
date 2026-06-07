import { NextRequest, NextResponse } from 'next/server'

// Lightweight client-error sink — receives error reports from app/error.tsx
// and logs them to the server's stdout, where pm2 captures them
// (`pm2 logs letsthinkpositive` on Hostinger). No DB writes, no file I/O —
// safe to run on shared hosting and won't itself crash the app.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, stack, digest, url, userAgent } = body ?? {}

    console.error(
      '[CLIENT ERROR]',
      JSON.stringify({
        time: new Date().toISOString(),
        url,
        message,
        digest,
        userAgent,
        stack: typeof stack === 'string' ? stack.slice(0, 2000) : undefined,
      })
    )
  } catch {
    // never let logging itself throw
  }

  return NextResponse.json({ ok: true })
}
