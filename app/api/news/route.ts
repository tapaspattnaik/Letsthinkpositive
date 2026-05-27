import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://newsapi.org/v2/everything'

// Curated positive keyword groups per category
const CATEGORY_QUERIES: Record<string, string> = {
  all:          '(breakthrough OR kindness OR hope OR inspiring OR achievement OR discovery OR healing OR community OR innovation OR uplifting)',
  science:      '(scientific breakthrough OR medical discovery OR space exploration OR climate solution OR clean energy)',
  kindness:     '(random act of kindness OR community helps OR volunteers OR charity OR donation OR rescued)',
  health:       '(health breakthrough OR mental health success OR recovery OR wellbeing OR cure OR treatment success)',
  environment:  '(reforestation OR ocean cleanup OR renewable energy OR wildlife recovery OR climate solution OR green)',
  innovation:   '(innovation OR invention OR startup success OR technology helps OR AI for good OR new solution)',
  people:       '(inspiring story OR overcomes OR triumph OR community OR hero OR saved OR celebrated)',
}

export async function GET(req: NextRequest) {
  const apiKey   = process.env.NEWS_API_KEY
  const category = req.nextUrl.searchParams.get('category') ?? 'all'
  const page     = req.nextUrl.searchParams.get('page') ?? '1'

  if (!apiKey) {
    // Return mock data if API key not yet configured
    return NextResponse.json({ articles: getMockArticles(), total: 10, configured: false })
  }

  const query = CATEGORY_QUERIES[category] ?? CATEGORY_QUERIES.all

  const url = new URL(BASE)
  url.searchParams.set('q',          query)
  url.searchParams.set('language',   'en')
  url.searchParams.set('sortBy',     'publishedAt')
  url.searchParams.set('pageSize',   '12')
  url.searchParams.set('page',       page)
  // Exclude sensationalist sources
  url.searchParams.set('excludeDomains', 'dailymail.co.uk,tmz.com,thesun.co.uk')
  url.searchParams.set('apiKey',     apiKey)

  try {
    const res  = await fetch(url.toString(), { next: { revalidate: 1800 } }) // cache 30 min
    const data = await res.json()

    if (!res.ok) return NextResponse.json({ error: data.message }, { status: 500 })

    const articles = (data.articles ?? [])
      .filter((a: NewsArticle) => a.title !== '[Removed]' && a.urlToImage)
      .map((a: NewsArticle) => ({
        title:       a.title,
        description: a.description,
        url:         a.url,
        image:       a.urlToImage,
        source:      a.source?.name,
        publishedAt: a.publishedAt,
      }))

    return NextResponse.json({ articles, total: data.totalResults, configured: true })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

interface NewsArticle {
  title: string; description: string; url: string
  urlToImage: string; source: { name: string }; publishedAt: string
}

function getMockArticles() {
  return [
    { title: 'Scientists discover promising new approach to ocean plastic cleanup', description: 'A team of researchers has developed a biodegradable net system that could remove up to 90% of microplastics from coastal waters.', url: '#', image: null, source: 'Science Daily', publishedAt: new Date().toISOString() },
    { title: 'Community garden transforms abandoned lot into thriving green space', description: 'Neighbours came together over 18 months to turn a derelict piece of land into a garden that now feeds 40 local families.', url: '#', image: null, source: 'The Guardian', publishedAt: new Date().toISOString() },
    { title: 'New mental health app reaches 1 million users in underserved communities', description: 'A free mental wellness platform designed for low-income users has hit a major milestone, offering guided therapy and peer support.', url: '#', image: null, source: 'TechCrunch', publishedAt: new Date().toISOString() },
    { title: 'Teenager\'s invention provides clean water to 10,000 people in rural India', description: 'A 16-year-old engineer built a solar-powered filtration device using recycled materials, now deployed across three districts.', url: '#', image: null, source: 'BBC News', publishedAt: new Date().toISOString() },
    { title: 'Record numbers of sea turtles nesting on Florida beaches this year', description: 'Conservation efforts have paid off with the highest recorded turtle nesting season in over 30 years.', url: '#', image: null, source: 'National Geographic', publishedAt: new Date().toISOString() },
    { title: 'Local bakery donates 10,000 meals to homeless shelters every month', description: 'A family-run bakery redirects unsold bread and pastries daily, partnering with 12 shelters across the city.', url: '#', image: null, source: 'Local News', publishedAt: new Date().toISOString() },
  ]
}
