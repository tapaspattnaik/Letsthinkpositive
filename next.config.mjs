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
    cpus: 2,  // max worker threads for static page generation (was 63 — now 2)
  },
}

export default nextConfig
