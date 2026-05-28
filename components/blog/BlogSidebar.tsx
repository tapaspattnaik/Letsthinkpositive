'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface PostMeta {
  slug: string; title: string; tag: string; author: string; date: string; excerpt: string
}

// Tag → contextual tool suggestions
const TAG_TOOLS: Record<string, { href: string; icon: string; label: string; desc: string }[]> = {
  Mindset: [
    { href: '/reframe',   icon: '🧠', label: 'Thought Reframer', desc: 'Reframe a negative thought with CBT' },
    { href: '/journal',   icon: '📓', label: 'Journal',          desc: 'Write your reflection today'         },
    { href: '/intention', icon: '🌅', label: 'Morning Intention', desc: 'Set your word for the day'          },
  ],
  Wellness: [
    { href: '/mood',       icon: '📊', label: 'Mood Tracker',  desc: 'Log how you feel today'              },
    { href: '/breathing',  icon: '🌬️', label: 'Breathing',     desc: 'A quick breathing exercise'          },
    { href: '/sounds',     icon: '🎧', label: 'Calm Sounds',   desc: 'Background sounds for focus & calm'  },
  ],
  Career: [
    { href: '/habits',     icon: '🎯', label: 'Habit Tracker',   desc: 'Build a daily work habit'           },
    { href: '/challenges', icon: '🏆', label: 'Challenges',      desc: 'Take a 7 or 30-day challenge'       },
    { href: '/vision-board', icon: '⭐', label: 'Vision Board', desc: 'Visualise your career goals'         },
  ],
  'Student Life': [
    { href: '/habits',     icon: '🎯', label: 'Habit Tracker',  desc: 'Build a daily study habit'           },
    { href: '/journal',    icon: '📓', label: 'Journal',         desc: 'Reflect on your day'                },
    { href: '/challenges', icon: '🏆', label: 'Challenges',      desc: 'A focused challenge to try'         },
  ],
  Habits: [
    { href: '/habits',     icon: '🎯', label: 'Habit Tracker',  desc: 'Track a habit you want to build'    },
    { href: '/challenges', icon: '🏆', label: 'Challenges',     desc: 'A structured 7 or 30-day challenge' },
    { href: '/mood',       icon: '📊', label: 'Mood Tracker',   desc: 'See how habits affect your mood'    },
  ],
}

const DEFAULT_TOOLS = [
  { href: '/reframe',   icon: '🧠', label: 'Thought Reframer', desc: 'Reframe a negative thought' },
  { href: '/journal',   icon: '📓', label: 'Journal',          desc: "Write what's on your mind"  },
  { href: '/mood',      icon: '📊', label: 'Mood Tracker',     desc: 'Log how you feel today'     },
]

const SHARE_PLATFORMS = [
  {
    name: 'X / Twitter', icon: '𝕏',
    color: 'hover:bg-black hover:text-white hover:border-black',
    url:   (t: string, u: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}`,
  },
  {
    name: 'WhatsApp', icon: '💬',
    color: 'hover:bg-[#25D366] hover:text-white hover:border-[#25D366]',
    url:   (_: string, u: string) => `https://wa.me/?text=${encodeURIComponent(u)}`,
  },
  {
    name: 'LinkedIn', icon: 'in',
    color: 'hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5]',
    url:   (_: string, u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
  },
  {
    name: 'Facebook', icon: 'f',
    color: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]',
    url:   (_: string, u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
]

interface Props {
  slug:     string
  title:    string
  tag:      string
  allPosts: PostMeta[]
}

export function BlogSidebar({ slug, title, tag, allPosts }: Props) {
  const [copied,   setCopied]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [pageUrl,  setPageUrl]  = useState('')

  // Related posts: same tag first, then recent, excluding current
  const related = allPosts
    .filter(p => p.slug !== slug)
    .sort((a, b) => (a.tag === tag ? -1 : b.tag === tag ? 1 : 0))
    .slice(0, 2)

  const tools = TAG_TOOLS[tag] ?? DEFAULT_TOOLS

  useEffect(() => {
    setPageUrl(window.location.href)
  }, [])

  const updateProgress = useCallback(() => {
    const article = document.querySelector('article')
    if (!article) return
    const { top, height } = article.getBoundingClientRect()
    const scrolled = Math.max(0, -top)
    const pct = Math.min(100, Math.round((scrolled / (height - window.innerHeight)) * 100))
    setProgress(isNaN(pct) ? 0 : pct)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()
    return () => window.removeEventListener('scroll', updateProgress)
  }, [updateProgress])

  function copyLink() {
    navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-[88px] flex flex-col gap-5">

        {/* Reading progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-teal-light/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-mid to-amber rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[0.72rem] text-text-xlight font-medium tabular-nums w-8 text-right">
            {progress}%
          </span>
        </div>

        {/* Share */}
        <div className="bg-white rounded-[20px] border border-teal-light p-5 shadow-card">
          <p className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-text-xlight mb-3">Share this post</p>
          <div className="grid grid-cols-2 gap-2">
            {SHARE_PLATFORMS.map(p => (
              <a key={p.name} href={p.url(title, pageUrl)}
                target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-2 px-3 py-2 rounded-[10px] border border-teal-light text-[0.8rem] font-semibold text-charcoal transition-all ${p.color}`}
                title={`Share on ${p.name}`}>
                <span className="text-[0.85rem]">{p.icon}</span>
                <span className="truncate">{p.name.split('/')[0].trim()}</span>
              </a>
            ))}
            <button
              onClick={copyLink}
              className={`col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-[10px] border text-[0.8rem] font-semibold transition-all
                ${copied
                  ? 'border-teal-mid bg-teal-ghost text-teal-deep'
                  : 'border-teal-light text-charcoal hover:border-teal-mid hover:bg-teal-ghost hover:text-teal-deep'}`}>
              {copied ? '✓ Copied!' : '🔗 Copy link'}
            </button>
          </div>
        </div>

        {/* More stories */}
        {related.length > 0 && (
          <div className="bg-white rounded-[20px] border border-teal-light p-5 shadow-card">
            <p className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-text-xlight mb-3">You might also enjoy</p>
            <div className="flex flex-col gap-3">
              {related.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`}
                  className="group flex flex-col no-underline">
                  <span className="text-[0.68rem] font-bold tracking-[0.1em] uppercase text-teal-mid mb-0.5">{post.tag}</span>
                  <span className="text-[0.88rem] font-semibold text-charcoal leading-snug group-hover:text-teal-deep transition-colors line-clamp-2">
                    {post.title}
                  </span>
                  <span className="text-[0.72rem] text-text-xlight mt-0.5">By {post.author}</span>
                </Link>
              ))}
            </div>
            <Link href="/blog"
              className="mt-4 block text-center text-[0.78rem] font-semibold text-teal-mid hover:text-teal-deep transition-colors no-underline">
              All posts →
            </Link>
          </div>
        )}

        {/* Contextual tools */}
        <div className="bg-teal-ghost rounded-[20px] border border-teal-light p-5">
          <p className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-text-xlight mb-3">Try these tools</p>
          <div className="flex flex-col gap-2">
            {tools.slice(0, 3).map(tool => (
              <Link key={tool.href} href={tool.href}
                className="flex items-center gap-3 px-3 py-2.5 bg-white rounded-[12px] hover:bg-ivory hover:shadow-sm transition-all no-underline group">
                <span className="text-[1.1rem] flex-shrink-0">{tool.icon}</span>
                <div className="min-w-0">
                  <p className="text-[0.83rem] font-semibold text-charcoal group-hover:text-teal-deep transition-colors leading-none mb-0.5">
                    {tool.label}
                  </p>
                  <p className="text-[0.72rem] text-text-xlight leading-tight truncate">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Talk to Bit */}
        <div className="bg-gradient-to-br from-teal-deep to-teal-dark rounded-[20px] p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[1.2rem]">🌿</span>
            <p className="font-semibold text-[0.9rem]">Talk to Bit</p>
          </div>
          <p className="text-white/70 text-[0.78rem] leading-[1.6] mb-4">
            Feeling something after this read? Bit is here to listen — no judgement, just quiet support.
          </p>
          <Link href="/coach"
            className="block w-full text-center bg-white/15 hover:bg-white/25 text-white text-[0.8rem] font-semibold py-2.5 rounded-full transition-colors no-underline">
            Open Bit →
          </Link>
        </div>

      </div>
    </aside>
  )
}
