'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#f5faf9', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '24px' }}>
        <div>
          <p style={{ fontSize: '3rem', marginBottom: '12px' }}>🌿</p>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e3a3a', marginBottom: '8px' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#567', fontSize: '0.9rem', marginBottom: '20px' }}>
            A critical error occurred. Try refreshing the page.
          </p>
          <button
            onClick={reset}
            style={{ background: '#0d7a6b', color: '#fff', border: 'none', borderRadius: '100px', padding: '12px 28px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
            Refresh
          </button>
        </div>
      </body>
    </html>
  )
}
