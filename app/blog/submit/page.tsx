'use client'

import { useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { LtpLogo } from '@/components/ui/LtpLogo'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(
  () => import('@/components/ui/RichTextEditor').then(m => ({ default: m.RichTextEditor })),
  { ssr: false, loading: () => (
    <div className="border border-teal-light rounded-[16px] bg-white animate-pulse" style={{ minHeight: 320 }} />
  )},
)

const CATEGORIES = [
  'Mindset', 'Wellness', 'Career', 'Student Life', 'Habits',
  'Gratitude', 'Anxiety & Stress', 'Relationships', 'Parenting',
  'Fitness & Movement', 'Nutrition', 'Sleep', 'Creativity',
  'Personal Growth', 'Spirituality', 'Community', 'Success Stories',
]

const SUB_CATEGORIES: Record<string, string[]> = {
  'Mindset':          ['Growth Mindset', 'Resilience', 'Positivity', 'Fear & Courage'],
  'Wellness':         ['Mental Health', 'Physical Health', 'Holistic Wellbeing'],
  'Career':           ['Job Search', 'Leadership', 'Burnout', 'Work-Life Balance'],
  'Student Life':     ['University', 'School', 'Exams', 'Social Life'],
  'Habits':           ['Morning Routine', 'Evening Routine', 'Breaking Bad Habits', 'Building New Ones'],
  'Gratitude':        ['Daily Gratitude', 'Gratitude Practice', 'Stories'],
  'Anxiety & Stress': ['Coping Techniques', 'Panic Attacks', 'Workplace Anxiety'],
  'Personal Growth':  ['Self-Discovery', 'Life Lessons', 'Turning Points'],
}

export default function BlogSubmitPage() {
  const { data: session, status } = useSession()
  const [title,       setTitle]       = useState('')
  const [excerpt,     setExcerpt]     = useState('')
  const [category,    setCategory]    = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [bodyText,    setBodyText]    = useState('')
  const [docFile,     setDocFile]     = useState<File | null>(null)
  const [images,      setImages]      = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [mode,        setMode]        = useState<'file' | 'text'>('file')
  const [submitting,  setSubmitting]  = useState(false)
  const [result,      setResult]      = useState<{ success?: string; error?: string; flagged?: boolean; issues?: string[] } | null>(null)
  const [dragOver,    setDragOver]    = useState(false)
  const fileInputRef  = useRef<HTMLInputElement>(null)
  const imgInputRef   = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) setDocFile(file)
  }, [])

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5 - images.length)
    setImages(prev => [...prev, ...files])
    files.forEach(f => {
      const reader = new FileReader()
      reader.onload = ev => setImagePreviews(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(f)
    })
  }

  function removeImage(i: number) {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!category) { setResult({ error: 'Please select a category.' }); return }
    if (mode === 'file' && !docFile) { setResult({ error: 'Please upload a document.' }); return }
    if (mode === 'text' && !bodyText.trim()) { setResult({ error: 'Please write your post content.' }); return }

    setSubmitting(true); setResult(null)

    const fd = new FormData()
    fd.append('title',       title)
    fd.append('excerpt',     excerpt)
    fd.append('category',    category)
    fd.append('subCategory', subCategory)
    if (mode === 'file' && docFile) fd.append('document', docFile)
    if (mode === 'text')            fd.append('bodyText', bodyText)
    images.forEach((img, i) => fd.append(`image_${i}`, img))

    try {
      const res  = await fetch('/api/blog/submit', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok)            setResult({ success: data.message })
      else if (res.status === 422) setResult({ flagged: true, issues: data.issues, error: data.message })
      else                   setResult({ error: data.error })
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}</div>
    </div>
  )

  if (!session) return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory flex items-center justify-center px-4 pt-[72px]">
      <div className="text-center max-w-[400px]">
        <LtpLogo size={52} />
        <h2 className="font-display text-[1.6rem] font-bold text-charcoal mt-4 mb-2">Sign in to submit a post</h2>
        <p className="text-text-mid text-[0.9rem] mb-6">Your story deserves to be heard. Sign in first to submit it.</p>
        <Link href="/login?callbackUrl=/blog/submit"
          className="bg-teal-deep text-white px-8 py-3 rounded-full font-semibold no-underline hover:bg-teal-dark transition-colors">
          Sign in →
        </Link>
      </div>
    </div>
  )

  if (result?.success) return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory flex items-center justify-center px-4 pt-[72px]">
      <div className="text-center max-w-[440px]">
        <p className="text-[4rem] mb-4">🌱</p>
        <h2 className="font-display text-[1.8rem] font-bold text-charcoal mb-3">Post submitted!</h2>
        <p className="text-text-mid text-[0.95rem] mb-2">{result.success}</p>
        <p className="text-text-xlight text-[0.85rem] mb-8">We review every post personally. If approved, it will appear on the blog — we may reach out if we have questions.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/blog" className="bg-teal-deep text-white px-6 py-3 rounded-full font-semibold no-underline hover:bg-teal-dark transition-colors">Back to Blog</Link>
          <button onClick={() => { setResult(null); setTitle(''); setExcerpt(''); setCategory(''); setSubCategory(''); setBodyText(''); setDocFile(null); setImages([]); setImagePreviews([]) }}
            className="border border-teal-mid text-teal-deep px-6 py-3 rounded-full font-semibold hover:bg-teal-ghost transition-colors">
            Submit another →
          </button>
        </div>
      </div>
    </div>
  )

  const subOptions = SUB_CATEGORIES[category] ?? []

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-16 px-[5%] text-white">
        <div className="max-w-[760px] mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-teal-light text-[0.85rem] no-underline hover:text-white mb-6 transition-colors">
            ← Back to Blog
          </Link>
          <h1 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-bold leading-snug mb-3">
            Share your story with the world ✍️
          </h1>
          <p className="text-white/72 text-[0.97rem] leading-[1.8] max-w-[520px]">
            Upload a document or write directly. Add images, pick a category, and we&apos;ll review and publish it — your voice matters here.
          </p>
        </div>
      </section>

      <div className="max-w-[760px] mx-auto py-12 px-[5%]">
        <form onSubmit={submit} className="space-y-8">

          {/* Title */}
          <div>
            <label className="block text-[0.82rem] font-bold tracking-wide uppercase text-text-xlight mb-2">Post Title *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Give your post a compelling title…"
              className="w-full border border-teal-light rounded-[16px] px-5 py-3.5 text-[1.05rem] font-semibold text-charcoal outline-none focus:border-teal-mid bg-white transition-colors placeholder:text-text-xlight placeholder:font-normal" />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.82rem] font-bold tracking-wide uppercase text-text-xlight mb-2">Category *</label>
              <select required value={category} onChange={e => { setCategory(e.target.value); setSubCategory('') }}
                className="w-full border border-teal-light rounded-[14px] px-4 py-3 text-[0.93rem] text-charcoal outline-none focus:border-teal-mid bg-white transition-colors">
                <option value="">Select a category…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {subOptions.length > 0 && (
              <div>
                <label className="block text-[0.82rem] font-bold tracking-wide uppercase text-text-xlight mb-2">Sub-category</label>
                <select value={subCategory} onChange={e => setSubCategory(e.target.value)}
                  className="w-full border border-teal-light rounded-[14px] px-4 py-3 text-[0.93rem] text-charcoal outline-none focus:border-teal-mid bg-white transition-colors">
                  <option value="">None</option>
                  {subOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Short excerpt */}
          <div>
            <label className="block text-[0.82rem] font-bold tracking-wide uppercase text-text-xlight mb-2">Short excerpt <span className="font-normal text-text-xlight">(optional — shows in blog listing)</span></label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)}
              placeholder="A 1–2 sentence summary of your post…"
              rows={2} maxLength={300}
              className="w-full border border-teal-light rounded-[14px] px-4 py-3 text-[0.93rem] text-charcoal outline-none focus:border-teal-mid bg-white transition-colors resize-none" />
            <p className="text-[0.72rem] text-text-xlight mt-1 text-right">{excerpt.length}/300</p>
          </div>

          {/* Content mode toggle */}
          <div>
            <label className="block text-[0.82rem] font-bold tracking-wide uppercase text-text-xlight mb-3">Your content *</label>
            <div className="flex rounded-[14px] border border-teal-light overflow-hidden mb-4">
              <button type="button" onClick={() => setMode('file')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[0.88rem] font-semibold transition-colors
                  ${mode === 'file' ? 'bg-teal-deep text-white' : 'bg-white text-text-mid hover:bg-teal-ghost'}`}>
                📎 Upload File
              </button>
              <button type="button" onClick={() => setMode('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[0.88rem] font-semibold transition-colors
                  ${mode === 'text' ? 'bg-teal-deep text-white' : 'bg-white text-text-mid hover:bg-teal-ghost'}`}>
                ✏️ Write Here
              </button>
            </div>

            {mode === 'file' ? (
              <div>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[18px] p-10 text-center cursor-pointer transition-all
                    ${dragOver ? 'border-teal-mid bg-teal-ghost' : 'border-teal-light hover:border-teal-mid hover:bg-teal-ghost/30'}`}>
                  <input ref={fileInputRef} type="file" accept=".docx,.pdf,.txt,.md" className="sr-only"
                    onChange={e => setDocFile(e.target.files?.[0] ?? null)} />
                  {docFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-[2rem]">📄</span>
                      <div className="text-left">
                        <p className="font-semibold text-teal-deep text-[0.95rem]">{docFile.name}</p>
                        <p className="text-text-xlight text-[0.78rem]">{(docFile.size / 1024).toFixed(1)} KB · Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[2.5rem] mb-3">📎</p>
                      <p className="font-semibold text-charcoal text-[0.95rem]">Drag & drop your file here</p>
                      <p className="text-text-xlight text-[0.83rem] mt-1">or click to browse</p>
                      <p className="text-text-xlight text-[0.75rem] mt-3">Supports: <strong>.docx · .pdf · .txt</strong> — up to 5 MB</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <RichTextEditor
                value={bodyText}
                onChange={setBodyText}
                placeholder="Write your post here… Pour your heart into it."
                minHeight={320}
              />
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-[0.82rem] font-bold tracking-wide uppercase text-text-xlight mb-2">
              Images <span className="font-normal text-text-xlight">(optional — up to 5, max 4 MB each)</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded-[12px] overflow-hidden border border-teal-light">
                  <Image src={src} alt="" fill className="object-cover" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full text-[0.6rem] flex items-center justify-center hover:bg-black/80">
                    ×
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button type="button" onClick={() => imgInputRef.current?.click()}
                  className="w-24 h-24 rounded-[12px] border-2 border-dashed border-teal-light hover:border-teal-mid hover:bg-teal-ghost transition-all flex flex-col items-center justify-center text-text-xlight hover:text-teal-deep">
                  <span className="text-[1.5rem]">📷</span>
                  <span className="text-[0.65rem] font-medium mt-1">Add image</span>
                </button>
              )}
              <input ref={imgInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={handleImagePick} />
            </div>
          </div>

          {result?.flagged && (
            <div className="bg-amber/10 border border-amber rounded-[16px] px-5 py-4 space-y-2">
              <p className="font-semibold text-[0.9rem] text-charcoal flex items-center gap-2">🚨 Post flagged by AI moderation</p>
              <p className="text-[0.85rem] text-text-mid">{result.error}</p>
              {result.issues && result.issues.length > 0 && (
                <ul className="text-[0.82rem] text-red-600 list-disc list-inside space-y-0.5">
                  {result.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                </ul>
              )}
              <p className="text-[0.78rem] text-text-xlight">Please revise your post and try again. If you believe this is an error, contact us.</p>
            </div>
          )}

          {!result?.flagged && result?.error && (
            <div className="bg-red-50 border border-red-200 rounded-[12px] px-4 py-3 text-red-600 text-[0.87rem]">
              {result.error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" disabled={submitting}
              className="bg-teal-deep text-white px-10 py-4 rounded-full font-bold text-[1rem] hover:bg-teal-dark disabled:opacity-60 transition-colors">
              {submitting ? 'Submitting…' : 'Submit for review →'}
            </button>
            <p className="text-[0.78rem] text-text-xlight leading-[1.6]">
              Posts are reviewed before going live.<br />We may edit for clarity or formatting.
            </p>
          </div>
        </form>
      </div>
    </>
  )
}
