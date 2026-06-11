// ── Client helpers for posting tool outputs to the community wall ───────────

/** Upload an image blob. Returns the URL, or 'login' when unauthenticated. */
export async function uploadWallImage(blob: Blob, filename: string): Promise<string | 'login' | null> {
  const fd = new FormData()
  fd.append('image', new File([blob], filename, { type: blob.type || 'image/png' }))
  try {
    const res = await fetch('/api/upload/post-image', { method: 'POST', body: fd })
    if (res.status === 401) return 'login'
    const d = await res.json()
    return res.ok && d.imageUrl ? d.imageUrl : null
  } catch {
    return null
  }
}

/** Create a community wall post (title derived from first line of body). */
export async function createWallPost(opts: { body: string; images?: string[]; tags?: string }): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body:     opts.body,
        images:   opts.images ?? [],
        tags:     opts.tags ?? '',
        postType: 'story',
      }),
    })
    const d = await res.json()
    return d.ok ? { ok: true } : { ok: false, error: d.error }
  } catch {
    return { ok: false, error: 'Network error — try again' }
  }
}
