import type { MetadataRoute } from 'next'
import { getAllPostSlugs } from '@/lib/posts'
import { getAllArticleSlugs } from '@/lib/library'
import { prisma } from '@/lib/db'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://letsthinkpositive.com'

// Public, indexable static routes — auth pages, admin, user-specific
// dashboards (profile, notifications, etc.) are intentionally excluded.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/',                 priority: 1.0, changeFrequency: 'daily'   },
  { path: '/about',            priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact',          priority: 0.4, changeFrequency: 'yearly'  },
  { path: '/blog',             priority: 0.8, changeFrequency: 'daily'   },
  { path: '/library',          priority: 0.8, changeFrequency: 'weekly'  },
  { path: '/tools',            priority: 0.8, changeFrequency: 'monthly' },
  { path: '/community',        priority: 0.7, changeFrequency: 'daily'   },
  { path: '/circles',          priority: 0.6, changeFrequency: 'weekly'  },
  { path: '/tribe',            priority: 0.5, changeFrequency: 'weekly'  },
  { path: '/coach',            priority: 0.7, changeFrequency: 'monthly' },
  { path: '/meditation',       priority: 0.7, changeFrequency: 'monthly' },
  { path: '/breathing',        priority: 0.7, changeFrequency: 'monthly' },
  { path: '/sounds',           priority: 0.6, changeFrequency: 'monthly' },
  { path: '/sleep',            priority: 0.6, changeFrequency: 'monthly' },
  { path: '/journal',          priority: 0.6, changeFrequency: 'monthly' },
  { path: '/mood',             priority: 0.6, changeFrequency: 'monthly' },
  { path: '/habits',           priority: 0.6, changeFrequency: 'monthly' },
  { path: '/gratitude-wall',   priority: 0.6, changeFrequency: 'weekly'  },
  { path: '/affirmation',      priority: 0.6, changeFrequency: 'monthly' },
  { path: '/birthday-card',    priority: 0.7, changeFrequency: 'monthly' },
  { path: '/reframe',          priority: 0.6, changeFrequency: 'monthly' },
  { path: '/intention',        priority: 0.6, changeFrequency: 'monthly' },
  { path: '/vision-board',     priority: 0.6, changeFrequency: 'monthly' },
  { path: '/quotes',           priority: 0.6, changeFrequency: 'monthly' },
  { path: '/quiz',             priority: 0.5, changeFrequency: 'monthly' },
  { path: '/assessments',      priority: 0.5, changeFrequency: 'monthly' },
  { path: '/challenges',       priority: 0.6, changeFrequency: 'weekly'  },
  { path: '/calendar',         priority: 0.5, changeFrequency: 'monthly' },
  { path: '/water',            priority: 0.5, changeFrequency: 'monthly' },
  { path: '/yoga',             priority: 0.6, changeFrequency: 'monthly' },
  { path: '/positive-eating',  priority: 0.5, changeFrequency: 'monthly' },
  { path: '/happy-foods',      priority: 0.5, changeFrequency: 'monthly' },
  { path: '/kindness-map',     priority: 0.5, changeFrequency: 'weekly'  },
  { path: '/good-news',        priority: 0.6, changeFrequency: 'daily'   },
  { path: '/kids',             priority: 0.5, changeFrequency: 'monthly' },
  { path: '/drawing',          priority: 0.4, changeFrequency: 'monthly' },
  { path: '/wisdom-coaching',  priority: 0.5, changeFrequency: 'monthly' },
  { path: '/habits-lab',       priority: 0.4, changeFrequency: 'monthly' },
  { path: '/snapshot',         priority: 0.4, changeFrequency: 'monthly' },
  { path: '/search',           priority: 0.3, changeFrequency: 'monthly' },
  { path: '/disclaimer',       priority: 0.2, changeFrequency: 'yearly'  },
  { path: '/privacy',          priority: 0.2, changeFrequency: 'yearly'  },
  { path: '/terms',            priority: 0.2, changeFrequency: 'yearly'  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(r => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  // Filesystem blog posts
  const blogSlugs = getAllPostSlugs()
  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map(slug => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // Filesystem library articles
  const librarySlugs = getAllArticleSlugs()
  const libraryEntries: MetadataRoute.Sitemap = librarySlugs.map(slug => ({
    url: `${SITE_URL}/library/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // DB-driven content — wrapped in try/catch so a DB hiccup never breaks the sitemap
  let userBlogEntries: MetadataRoute.Sitemap = []
  let circleEntries: MetadataRoute.Sitemap = []
  let profileEntries: MetadataRoute.Sitemap = []

  try {
    const [userBlogPosts, circles, topUsers] = await Promise.all([
      prisma.userBlogPost.findMany({
        where:  { status: 'approved' },
        select: { slug: true, updatedAt: true },
        take:   500,
      }),
      prisma.circle.findMany({
        where:  { isPrivate: false },
        select: { slug: true, createdAt: true },
        take:   200,
      }),
      // Only index profiles with some public activity — avoids thin/empty pages
      prisma.user.findMany({
        where:  { posts: { some: { approved: true } } },
        select: { id: true, updatedAt: true },
        take:   500,
      }),
    ])

    userBlogEntries = userBlogPosts
      .filter(p => p.slug)
      .map(p => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: p.updatedAt ?? now,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }))

    circleEntries = circles
      .filter(c => c.slug)
      .map(c => ({
        url: `${SITE_URL}/circles/${c.slug}`,
        lastModified: c.createdAt ?? now,
        changeFrequency: 'weekly' as const,
        priority: 0.4,
      }))

    profileEntries = topUsers.map(u => ({
      url: `${SITE_URL}/profile/${u.id}`,
      lastModified: u.updatedAt ?? now,
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    }))
  } catch {
    // DB unavailable at build time — ship the sitemap with static routes only
  }

  return [
    ...staticEntries,
    ...blogEntries,
    ...libraryEntries,
    ...userBlogEntries,
    ...circleEntries,
    ...profileEntries,
  ]
}
