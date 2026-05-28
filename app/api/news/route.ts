import { NextRequest, NextResponse } from 'next/server'

// Always run fresh — never let Vercel/Next.js cache this route at the edge
export const dynamic  = 'force-dynamic'
export const revalidate = 0

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
    return NextResponse.json({ articles: getMockArticles(category), total: 10, configured: false })
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
    const res  = await fetch(url.toString(), { cache: 'no-store' })
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

    return NextResponse.json(
      { articles, total: data.totalResults, configured: true },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

interface NewsArticle {
  title: string; description: string; url: string
  urlToImage: string; source: { name: string }; publishedAt: string
}

interface MockArticle {
  title: string; description: string; url: string
  image: null; source: string; publishedAt: string
}

const MOCK_BY_CATEGORY: Record<string, MockArticle[]> = {
  science: [
    { title: 'Scientists discover promising new approach to ocean plastic cleanup', description: 'A team of researchers has developed a biodegradable net system that could remove up to 90% of microplastics from coastal waters.', url: '#', image: null, source: 'Science Daily', publishedAt: new Date().toISOString() },
    { title: 'Breakthrough gene therapy restores hearing in children born deaf', description: 'Clinical trials show a single injection can restore near-normal hearing in children with a specific genetic mutation — a world first.', url: '#', image: null, source: 'Nature Medicine', publishedAt: new Date().toISOString() },
    { title: 'NASA confirms water ice found in permanently shadowed lunar craters', description: 'New data from the Lunar Reconnaissance Orbiter confirms large deposits of water ice, opening the door for sustained moon missions.', url: '#', image: null, source: 'NASA', publishedAt: new Date().toISOString() },
    { title: 'AI model predicts Alzheimer\'s up to 7 years before symptoms appear', description: 'A machine-learning system trained on MRI scans can now detect early signs of Alzheimer\'s with 82% accuracy years before clinical diagnosis.', url: '#', image: null, source: 'The Lancet', publishedAt: new Date().toISOString() },
    { title: 'Solar panels that generate power at night developed by researchers', description: 'Stanford engineers have created a photovoltaic cell that uses radiative cooling to produce electricity even without sunlight.', url: '#', image: null, source: 'Science Daily', publishedAt: new Date().toISOString() },
    { title: 'New coral reef restoration technique shows 90% survival rate', description: 'Coral gardening paired with assisted evolution has produced heat-tolerant reef segments surviving unprecedented warming events.', url: '#', image: null, source: 'Marine Science Journal', publishedAt: new Date().toISOString() },
  ],
  kindness: [
    { title: 'Local bakery donates 10,000 meals to homeless shelters every month', description: 'A family-run bakery redirects unsold bread and pastries daily, partnering with 12 shelters across the city.', url: '#', image: null, source: 'Local News', publishedAt: new Date().toISOString() },
    { title: 'Strangers rally to rebuild home of elderly couple after fire', description: 'Over 400 volunteers showed up across three weekends to completely rebuild the home of a retired couple who lost everything.', url: '#', image: null, source: 'Community Herald', publishedAt: new Date().toISOString() },
    { title: 'Bus driver learns sign language to communicate with deaf student', description: 'A school bus driver spent six months learning sign language so his lone deaf passenger would not feel alone on the daily ride.', url: '#', image: null, source: 'Upworthy', publishedAt: new Date().toISOString() },
    { title: 'Teen starts free library of warm coats for anyone who needs one', description: 'A 15-year-old set up a "take one, leave one" coat exchange that has distributed over 3,000 coats across two winters.', url: '#', image: null, source: 'Good News Network', publishedAt: new Date().toISOString() },
    { title: 'Restaurant employs only people over 60 — and has a year-long waitlist', description: 'A diner in New York exclusively hires retirees, saying the experience, warmth, and stories they bring are irreplaceable.', url: '#', image: null, source: 'NBC News', publishedAt: new Date().toISOString() },
    { title: 'Community garden transforms abandoned lot into green space feeding 40 families', description: 'Neighbours came together over 18 months to turn derelict land into a garden that now feeds dozens of local families.', url: '#', image: null, source: 'The Guardian', publishedAt: new Date().toISOString() },
  ],
  health: [
    { title: 'New mental health app reaches 1 million users in underserved communities', description: 'A free mental wellness platform designed for low-income users has hit a major milestone, offering guided therapy and peer support.', url: '#', image: null, source: 'TechCrunch', publishedAt: new Date().toISOString() },
    { title: 'Study: 10 minutes of daily gratitude journalling reduces anxiety by 28%', description: 'A randomised controlled trial of 1,200 participants found that a brief daily gratitude practice significantly reduced generalised anxiety.', url: '#', image: null, source: 'JAMA Psychiatry', publishedAt: new Date().toISOString() },
    { title: 'WHO declares first successful eradication of a parasitic disease in a decade', description: 'Guinea worm disease is now on the verge of becoming only the second human disease ever eradicated — cases fell from 3.5 million to under 15.', url: '#', image: null, source: 'WHO', publishedAt: new Date().toISOString() },
    { title: 'Childhood cancer survival rates reach all-time high of 85%', description: 'Advances in targeted therapy and immunotherapy have pushed five-year survival rates for paediatric cancers to historic highs.', url: '#', image: null, source: 'Cancer Research UK', publishedAt: new Date().toISOString() },
    { title: 'Walking 7,000 steps a day linked to 50% lower risk of early death', description: 'A large cohort study confirms that moderate daily walking — far less than the classic "10,000 steps" — provides major longevity benefits.', url: '#', image: null, source: 'JAMA Network Open', publishedAt: new Date().toISOString() },
    { title: 'Ketamine therapy approved for treatment-resistant depression in the UK', description: 'NHS England approves esketamine nasal spray for patients who have not responded to two or more antidepressants — a landmark for mental health care.', url: '#', image: null, source: 'BMJ', publishedAt: new Date().toISOString() },
  ],
  environment: [
    { title: 'Record numbers of sea turtles nesting on Florida beaches this year', description: 'Conservation efforts have paid off with the highest recorded turtle nesting season in over 30 years along the Florida coast.', url: '#', image: null, source: 'National Geographic', publishedAt: new Date().toISOString() },
    { title: 'Costa Rica runs on 100% renewable energy for 400 consecutive days', description: 'The Central American nation has broken its own world record for sustained renewable electricity generation using hydro, wind and solar.', url: '#', image: null, source: 'Reuters', publishedAt: new Date().toISOString() },
    { title: 'Europe\'s wolf population triples in 25 years thanks to rewilding efforts', description: 'Driven by protected-area expansion and cross-border conservation treaties, wolf numbers in Europe have rebounded to over 20,000.', url: '#', image: null, source: 'WWF', publishedAt: new Date().toISOString() },
    { title: 'India plants 250 million trees in a single day — a new world record', description: 'As part of a national reforestation drive, 1.5 million volunteers participated in a coordinated tree-planting event across 20 states.', url: '#', image: null, source: 'NDTV', publishedAt: new Date().toISOString() },
    { title: 'Pacific garbage patch cleanup removes 200 tonnes of plastic', description: 'The Ocean Cleanup project\'s latest deployment has extracted a record haul of ocean plastic, with improved retention systems preventing bycatch.', url: '#', image: null, source: 'The Ocean Cleanup', publishedAt: new Date().toISOString() },
    { title: 'Electric vehicle sales outpace petrol cars in Europe for first time', description: 'Monthly EV registrations exceeded ICE vehicles across the EU in a historic shift, driven by subsidies and expanding charging infrastructure.', url: '#', image: null, source: 'Bloomberg Green', publishedAt: new Date().toISOString() },
  ],
  innovation: [
    { title: 'Teenager\'s invention provides clean water to 10,000 people in rural India', description: 'A 16-year-old engineer built a solar-powered filtration device using recycled materials, now deployed across three districts.', url: '#', image: null, source: 'BBC News', publishedAt: new Date().toISOString() },
    { title: 'AI detects early-stage pancreatic cancer with 96% accuracy in new trial', description: 'A deep-learning model trained on CT scans identifies pancreatic tumours at a stage when surgical cure is still possible — far earlier than current methods.', url: '#', image: null, source: 'MIT Technology Review', publishedAt: new Date().toISOString() },
    { title: 'Startup builds affordable prosthetic arms using 3-D printing for $50', description: 'A social enterprise has shipped over 20,000 low-cost 3-D-printed prosthetics to amputees in developing countries, transforming lives for the cost of a dinner.', url: '#', image: null, source: 'Fast Company', publishedAt: new Date().toISOString() },
    { title: 'New biodegradable plastic breaks down in seawater in six weeks', description: 'Chemists have developed a polymer derived from seaweed that fully biodegrades in marine environments — a potential revolution for packaging waste.', url: '#', image: null, source: 'Nature Chemistry', publishedAt: new Date().toISOString() },
    { title: 'Lab-grown timber could replace deforestation for construction by 2035', description: 'MIT researchers have grown wood tissue in a lab without felling a single tree, opening a path toward scalable sustainable construction materials.', url: '#', image: null, source: 'MIT News', publishedAt: new Date().toISOString() },
    { title: 'Vertical farms in Mumbai supply fresh produce to 50,000 families daily', description: 'Urban agriculture startups are transforming city rooftops and warehouses into high-yield food systems that use 95% less water than conventional farms.', url: '#', image: null, source: 'Economic Times', publishedAt: new Date().toISOString() },
  ],
  people: [
    { title: '93-year-old grandmother completes her university degree after 70-year gap', description: 'Having left college to raise her family in 1952, Doris finally walked the stage last week — to a standing ovation from every student and faculty member.', url: '#', image: null, source: 'BBC News', publishedAt: new Date().toISOString() },
    { title: 'Blind hiker becomes first to summit all 48 peaks of the White Mountains', description: 'Using echolocation, trekking poles and sheer determination, 34-year-old Adrian completed the last peak to cheers from a waiting crowd of supporters.', url: '#', image: null, source: 'Outside Magazine', publishedAt: new Date().toISOString() },
    { title: 'Former refugee now runs the largest food bank in the city that once sheltered him', description: 'After arriving with nothing 20 years ago, he now distributes over 5,000 meals a week — and employs 60 people from similar backgrounds.', url: '#', image: null, source: 'The Guardian', publishedAt: new Date().toISOString() },
    { title: 'Single father cycles 5,000 km to raise funds for his son\'s surgery', description: 'A 38-year-old mechanic with no cycling experience completed a coast-to-coast ride in 47 days, raising three times his target amount.', url: '#', image: null, source: 'Times of India', publishedAt: new Date().toISOString() },
    { title: 'Community celebrates teacher who spent 40 years never missing a single day', description: 'Mr. Patel retired last month with a perfect attendance record spanning four decades — his students, now adults, threw him a surprise celebration.', url: '#', image: null, source: 'Local News', publishedAt: new Date().toISOString() },
    { title: 'Street artist transforms crumbling city walls into murals celebrating local heroes', description: 'Over three years, Asha has painted 120 murals featuring unsung community figures — nurses, sanitation workers, teachers — across the city\'s most neglected streets.', url: '#', image: null, source: 'Scroll.in', publishedAt: new Date().toISOString() },
  ],
}

// "All" pool — a hand-picked mix from every category
const MOCK_ALL: MockArticle[] = [
  MOCK_BY_CATEGORY.science[0],
  MOCK_BY_CATEGORY.kindness[0],
  MOCK_BY_CATEGORY.health[0],
  MOCK_BY_CATEGORY.environment[0],
  MOCK_BY_CATEGORY.innovation[0],
  MOCK_BY_CATEGORY.people[0],
  MOCK_BY_CATEGORY.science[1],
  MOCK_BY_CATEGORY.kindness[1],
  MOCK_BY_CATEGORY.health[1],
  MOCK_BY_CATEGORY.environment[1],
  MOCK_BY_CATEGORY.innovation[1],
  MOCK_BY_CATEGORY.people[1],
]

function getMockArticles(category = 'all'): MockArticle[] {
  if (category === 'all') return MOCK_ALL
  return MOCK_BY_CATEGORY[category] ?? MOCK_ALL
}
