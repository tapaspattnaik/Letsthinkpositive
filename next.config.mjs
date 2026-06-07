/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'letsthinkpositive.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    unoptimized: true,   // allow local /uploads/ avatars without domain restriction
  },

  // ── Hostinger shared hosting: limit build concurrency ──────────────────
  // Without this, `next build` spawns 60+ worker threads and blows past the
  // shared hosting process limit, causing 503s right after every deployment.
  experimental: {
    cpus: 2,
  },

  async headers() {
    return [
      {
        // Security headers on everything
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'SAMEORIGIN' },
        ],
      },
      {
        // _next/static/ assets have content-hashed filenames → safe to cache long-term
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // HTML pages: no-store so mobile browsers NEVER cache the HTML document.
        // Cached HTML with stale chunk filenames was causing JS 404s on mobile,
        // preventing React from mounting (loader stuck forever).
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
}

export default nextConfig
