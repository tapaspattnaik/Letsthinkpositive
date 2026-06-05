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

  // Prevent mobile browsers from caching stale JS bundles.
  // Next.js static assets (_next/static/) already have long-term cache with
  // content hashes, so this only affects HTML pages.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'SAMEORIGIN' },
        ],
      },
      {
        // HTML pages: short cache so mobile gets fresh JS references immediately
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ]
  },
}

export default nextConfig
