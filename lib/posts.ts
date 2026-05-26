import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

export interface PostMeta {
  slug:    string
  title:   string
  date:    string
  tag:     string
  author:  string
  excerpt: string
}

export interface Post extends PostMeta {
  contentHtml: string
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
}

export function getAllPosts(): PostMeta[] {
  const slugs = getAllPostSlugs()
  return slugs
    .map(slug => {
      const fullPath = path.join(POSTS_DIR, `${slug}.md`)
      const { data } = matter(fs.readFileSync(fullPath, 'utf8'))
      return { slug, ...data } as PostMeta
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPost(slug: string): Promise<Post | null> {
  const fullPath = path.join(POSTS_DIR, `${slug}.md`)
  if (!fs.existsSync(fullPath)) return null

  const { data, content } = matter(fs.readFileSync(fullPath, 'utf8'))
  const processed = await remark().use(remarkGfm).use(remarkHtml).process(content)

  return {
    slug,
    contentHtml: processed.toString(),
    ...data,
  } as Post
}
