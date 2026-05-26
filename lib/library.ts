import fs   from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark }     from 'remark'
import remarkGfm      from 'remark-gfm'
import remarkHtml     from 'remark-html'

const LIBRARY_DIR = path.join(process.cwd(), 'content', 'library')

export interface ArticleMeta {
  slug:       string
  title:      string
  excerpt:    string
  author:     string
  authorBio:  string
  date:       string
  category:   string
  tags:       string[]
  image:      string
  featured:   boolean
  readTime:   number      // minutes
}

export interface Article extends ArticleMeta {
  contentHtml:     string
  relatedSlugs:    string[]
}

export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(LIBRARY_DIR)) return []
  return fs
    .readdirSync(LIBRARY_DIR)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const slug = file.replace(/\.md$/, '')
      const { data } = matter(fs.readFileSync(path.join(LIBRARY_DIR, file), 'utf8'))
      return {
        slug,
        title:     data.title     ?? '',
        excerpt:   data.excerpt   ?? '',
        author:    data.author    ?? 'LTP Team',
        authorBio: data.authorBio ?? '',
        date:      data.date      ?? '',
        category:  data.category  ?? '',
        tags:      Array.isArray(data.tags) ? data.tags : [],
        image:     data.image     ?? '',
        featured:  data.featured  ?? false,
        readTime:  data.readTime  ?? 5,
      } as ArticleMeta
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getAllArticleSlugs(): string[] {
  if (!fs.existsSync(LIBRARY_DIR)) return []
  return fs.readdirSync(LIBRARY_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
}

export async function getArticle(slug: string): Promise<Article | null> {
  const filePath = path.join(LIBRARY_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null
  const { data, content } = matter(fs.readFileSync(filePath, 'utf8'))
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content)
  return {
    slug,
    title:       data.title     ?? '',
    excerpt:     data.excerpt   ?? '',
    author:      data.author    ?? 'LTP Team',
    authorBio:   data.authorBio ?? '',
    date:        data.date      ?? '',
    category:    data.category  ?? '',
    tags:        Array.isArray(data.tags) ? data.tags : [],
    image:       data.image     ?? '',
    featured:    data.featured  ?? false,
    readTime:    data.readTime  ?? 5,
    contentHtml: processed.toString(),
    relatedSlugs: Array.isArray(data.related) ? data.related : [],
  }
}

export const ALL_CATEGORIES = [
  'Mindfulness', 'Sleep', 'Gratitude', 'Anxiety',
  'Relaxation', 'Self-Care', 'Movement', 'Affirmations',
]
