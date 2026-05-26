'use client'

import { useState, useEffect } from 'react'

interface VisionCard {
  id:        string
  title:     string
  statement: string
  prompt:    string
  icon:      string
  color:     string
  createdAt: string
}

const TEMPLATES: Omit<VisionCard, 'id' | 'createdAt'>[] = [
  { title: 'Dream Big',       statement: 'Believe in your dreams and take the first step towards making them a reality.', prompt: 'What do you truly desire to create in your life?',    icon: '⭐', color: 'from-amber/20 to-amber/5'       },
  { title: 'Inner Peace',     statement: 'You deserve a life that feels calm, purposeful, and deeply your own.',          prompt: 'What does peace look and feel like for you?',           icon: '🕊️', color: 'from-teal-ghost to-white'      },
  { title: 'Stronger Every Day', statement: 'Each challenge you face is building the person you\'re becoming.',           prompt: 'What strength do you want to grow this year?',          icon: '🌱', color: 'from-green-50 to-white'        },
  { title: 'Love & Connection', statement: 'The relationships you nurture are the foundation of a meaningful life.',      prompt: 'What kind of relationships do you want to cultivate?', icon: '💛', color: 'from-amber/15 to-white'        },
  { title: 'Health & Vitality', statement: 'Your body is the only home you\'ll live in forever. Treat it with care.',    prompt: 'How do you want to feel in your body every day?',       icon: '🌟', color: 'from-teal-ghost to-white'      },
  { title: 'My Purpose',       statement: 'Your unique gifts are meant to be shared with the world.',                    prompt: 'What impact do you want your life to have?',            icon: '🎯', color: 'from-[#F3E8FF] to-white'      },
]

const ICON_OPTIONS   = ['⭐', '🌱', '💛', '🎯', '🌟', '🕊️', '🔥', '🌈', '🏠', '✈️', '📚', '💼', '🎨', '🎵', '🌺']
const COLOUR_OPTIONS = [
  'from-amber/20 to-amber/5', 'from-teal-ghost to-white', 'from-green-50 to-white',
  'from-amber/15 to-white',   'from-[#F3E8FF] to-white',  'from-blue-50 to-white',
]

const STORAGE_KEY = 'ltp_vision_board'

export default function VisionBoardPage() {
  const [cards, setCards]       = useState<VisionCard[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [form, setForm]         = useState({
    title: '', statement: '', prompt: '', icon: '⭐', color: COLOUR_OPTIONS[0]
  })

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setCards(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  function saveCards(updated: VisionCard[]) {
    setCards(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  function addTemplate(tpl: typeof TEMPLATES[number]) {
    const card: VisionCard = { ...tpl, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    saveCards([...cards, card])
  }

  function addCustom(e: React.FormEvent) {
    e.preventDefault()
    const card: VisionCard = { ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    saveCards([...cards, card])
    setForm({ title: '', statement: '', prompt: '', icon: '⭐', color: COLOUR_OPTIONS[0] })
    setShowForm(false)
  }

  function deleteCard(id: string) {
    saveCards(cards.filter(c => c.id !== id))
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
              <span className="w-6 h-0.5 bg-amber rounded" /> Vision Board
            </div>
            <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-snug mb-4">
              See it. <em className="italic text-amber-soft">Believe it. Build it.</em>
            </h1>
            <p className="text-white/72 text-[1.05rem] leading-[1.8] max-w-[480px] mb-6">
              Your vision board is a visual map of your deepest intentions. Place it where you&apos;ll see it every day.
            </p>
            <button onClick={() => setShowInstructions(!showInstructions)}
              className="text-teal-light text-[0.85rem] hover:text-white transition-colors underline underline-offset-2">
              How to use this →
            </button>
          </div>
          <div className="hidden md:block flex-shrink-0 text-[6rem]">🌟</div>
        </div>
        {showInstructions && (
          <div className="max-w-6xl mx-auto mt-6 bg-white/8 border border-white/15 rounded-[20px] px-7 py-5 text-white/80 text-[0.88rem] leading-[1.8]">
            <strong className="text-white">How to use your Vision Board:</strong> Add cards using templates or create your own.
            Write your vision, reflect on the prompt, and place the board where you see it daily.
            Each card represents an intention — return to them often. Cards are saved privately in your browser.
          </div>
        )}
      </section>

      <div className="max-w-6xl mx-auto py-14 px-[5%]">

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-teal-deep text-white px-6 py-3 rounded-full font-semibold text-[0.9rem] hover:bg-teal-dark transition-colors">
            + Add Your Vision
          </button>
          <span className="text-text-xlight text-[0.85rem] self-center">or add from templates below</span>
        </div>

        {/* Add Form */}
        {showForm && (
          <form onSubmit={addCustom} className="bg-teal-ghost border border-teal-light rounded-[24px] p-8 mb-10">
            <h3 className="font-display text-[1.2rem] text-charcoal font-semibold mb-5">Create Your Vision Card</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Card Title *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Dream Big, My Health, My Purpose"
                  className="w-full px-4 py-3 bg-white border border-teal-light rounded-[14px] text-[0.9rem] outline-none focus:border-teal-mid transition-colors" />
              </div>
              <div>
                <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Reflection Prompt</label>
                <input value={form.prompt} onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
                  placeholder="What question guides this vision?"
                  className="w-full px-4 py-3 bg-white border border-teal-light rounded-[14px] text-[0.9rem] outline-none focus:border-teal-mid transition-colors" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Supportive Statement *</label>
              <textarea required rows={2} value={form.statement} onChange={e => setForm(f => ({ ...f, statement: e.target.value }))}
                placeholder="Write your intention or affirmation for this vision..."
                className="w-full px-4 py-3 bg-white border border-teal-light rounded-[14px] text-[0.9rem] outline-none focus:border-teal-mid transition-colors resize-none" />
            </div>
            <div className="flex gap-6 flex-wrap mb-5">
              <div>
                <label className="block text-[0.82rem] font-semibold text-text-mid mb-2">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {ICON_OPTIONS.map(ic => (
                    <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      className={`text-[1.4rem] w-9 h-9 rounded-lg transition-all ${form.icon === ic ? 'bg-teal-mid ring-2 ring-teal-deep' : 'hover:bg-teal-ghost'}`}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[0.82rem] font-semibold text-text-mid mb-2">Colour</label>
                <div className="flex gap-2">
                  {COLOUR_OPTIONS.map(col => (
                    <button key={col} type="button" onClick={() => setForm(f => ({ ...f, color: col }))}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${col} border-2 transition-all ${form.color === col ? 'border-teal-deep scale-110' : 'border-teal-light'}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-teal-deep text-white px-6 py-2.5 rounded-full font-semibold text-[0.9rem] hover:bg-teal-dark transition-colors">
                Add to Board
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-teal-light rounded-full text-[0.9rem] text-text-mid hover:border-teal-mid transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* My Board */}
        {cards.length > 0 && (
          <div className="mb-14">
            <h2 className="font-display text-[1.15rem] text-charcoal font-semibold mb-6">
              My Vision Board <span className="text-text-xlight font-normal text-[0.85rem]">({cards.length} cards)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map(card => (
                <div key={card.id}
                  className={`bg-gradient-to-br ${card.color} border border-teal-light rounded-[24px] p-7 group relative`}>
                  <button onClick={() => deleteCard(card.id)}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/50 text-text-xlight hover:bg-red-50 hover:text-red-400 transition-all text-[0.75rem] opacity-0 group-hover:opacity-100">
                    ✕
                  </button>
                  <span className="text-[2.5rem] block mb-3">{card.icon}</span>
                  <h3 className="font-display text-[1.15rem] text-charcoal font-semibold mb-2">{card.title}</h3>
                  {card.prompt && (
                    <p className="text-[0.82rem] text-teal-mid italic mb-3">"{card.prompt}"</p>
                  )}
                  <p className="text-text-mid text-[0.88rem] leading-[1.7]">{card.statement}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates */}
        <div>
          <h2 className="font-display text-[1.15rem] text-charcoal font-semibold mb-3">Example Cards</h2>
          <p className="text-text-light text-[0.88rem] mb-6">Click any card to add it to your board. Customise it from there.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map((tpl, i) => {
              const alreadyAdded = cards.some(c => c.title === tpl.title)
              return (
                <div key={i}
                  className={`bg-gradient-to-br ${tpl.color} border border-dashed border-teal-light rounded-[24px] p-7 transition-all ${
                    alreadyAdded ? 'opacity-50' : 'cursor-pointer hover:-translate-y-1 hover:border-teal-mid hover:shadow-lift'
                  }`}
                  onClick={() => !alreadyAdded && addTemplate(tpl)}>
                  <span className="text-[2.5rem] block mb-3">{tpl.icon}</span>
                  <h3 className="font-display text-[1.1rem] text-charcoal font-semibold mb-2">{tpl.title}</h3>
                  <p className="text-text-xlight text-[0.82rem] italic mb-3">"{tpl.prompt}"</p>
                  <p className="text-text-mid text-[0.85rem] leading-[1.7] mb-4">{tpl.statement}</p>
                  <span className={`text-[0.78rem] font-semibold ${alreadyAdded ? 'text-text-xlight' : 'text-teal-mid'}`}>
                    {alreadyAdded ? '✓ Added' : '+ Add to Board'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
