'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface DayData {
  date: string
  mood?: number
  sleep?: { durationMins: number; quality: number }
  habits?: number
  journal?: boolean
  challenge?: boolean
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const MOOD_COLORS: Record<number, string> = {
  1: 'bg-red-400',
  2: 'bg-orange-400',
  3: 'bg-amber',
  4: 'bg-teal-mid',
  5: 'bg-teal-deep',
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

export default function WellnessCalendarPage() {
  const { data: session, status } = useSession()
  const today   = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [data,  setData]  = useState<Record<string, DayData>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!session) return
    setLoading(true)
    try {
      const [moodRes, sleepRes] = await Promise.all([
        fetch('/api/mood'),
        fetch('/api/sleep'),
      ])
      const dayMap: Record<string, DayData> = {}

      if (moodRes.ok) {
        const moods = await moodRes.json()
        for (const m of (Array.isArray(moods) ? moods : [])) {
          const d = (m.date ?? m.createdAt ?? '').slice(0, 10)
          if (!d) continue
          if (!dayMap[d]) dayMap[d] = { date: d }
          dayMap[d].mood = m.score ?? m.mood ?? 3
        }
      }
      if (sleepRes.ok) {
        const sleeps = await sleepRes.json()
        for (const s of (Array.isArray(sleeps) ? sleeps : [])) {
          const d = s.date?.slice(0, 10)
          if (!d) continue
          if (!dayMap[d]) dayMap[d] = { date: d }
          dayMap[d].sleep = { durationMins: s.durationMins, quality: s.quality }
        }
      }
      setData(dayMap)
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [session])

  useEffect(() => { if (status === 'authenticated') fetchData() }, [status, fetchData])

  function prevMonth() { if (month === 0) { setYear(y => y-1); setMonth(11) } else setMonth(m => m-1) }
  function nextMonth() {
    const now = new Date()
    if (year === now.getFullYear() && month === now.getMonth()) return
    if (month === 11) { setYear(y => y+1); setMonth(0) } else setMonth(m => m+1)
  }

  const firstDay  = new Date(year, month, 1).getDay()
  const daysCount = new Date(year, month + 1, 0).getDate()
  const todayStr  = today.toISOString().slice(0, 10)
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  const selectedDay = selected ? data[selected] : null

  if (status === 'unauthenticated') return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px] flex items-center justify-center px-4">
      <div className="text-center">
        <span className="text-[4rem] block mb-4">📅</span>
        <h1 className="font-display text-[1.8rem] text-charcoal font-bold mb-3">Wellness Calendar</h1>
        <p className="text-text-mid mb-6">Sign in to see your wellness journey mapped on a calendar.</p>
        <Link href="/login" className="bg-teal-deep text-white px-7 py-3 rounded-full font-semibold no-underline hover:bg-teal-dark transition-colors">Sign in →</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost/50 to-ivory pt-[72px] pb-16">
      <div className="max-w-5xl mx-auto px-[5%] pt-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-[2rem] text-charcoal font-bold">Wellness Calendar</h1>
            <p className="text-text-mid text-[0.88rem]">Your wellness journey, day by day.</p>
          </div>
          <div className="flex gap-2">
            {[
              { href: '/mood',  icon: '📊', label: 'Log Mood'  },
              { href: '/sleep', icon: '🌙', label: 'Log Sleep' },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="flex items-center gap-2 bg-teal-deep text-white px-4 py-2 rounded-full font-semibold text-[0.82rem] no-underline hover:bg-teal-dark transition-colors">
                {l.icon} {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

          {/* Calendar */}
          <div className="bg-white rounded-[24px] p-6 shadow-card border border-teal-light">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-teal-ghost transition-colors text-charcoal">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
              <h2 className="font-display text-[1.2rem] font-bold text-charcoal">{MONTH_NAMES[month]} {year}</h2>
              <button onClick={nextMonth} disabled={isCurrentMonth}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-teal-ghost disabled:opacity-30 transition-colors text-charcoal">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-[0.7rem] font-bold text-text-xlight py-2">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysCount }).map((_, i) => {
                const day     = i + 1
                const dateStr = formatDate(year, month, day)
                const dayData = data[dateStr]
                const isToday = dateStr === todayStr
                const isFuture = dateStr > todayStr
                const isSelected = selected === dateStr
                const hasMood  = !!dayData?.mood
                const hasSleep = !!dayData?.sleep

                return (
                  <button
                    key={day}
                    onClick={() => !isFuture && setSelected(isSelected ? null : dateStr)}
                    disabled={isFuture}
                    className={`relative aspect-square rounded-[10px] flex flex-col items-center justify-center text-[0.82rem] font-semibold transition-all
                      ${isToday    ? 'border-2 border-teal-deep bg-teal-ghost'       : ''}
                      ${isSelected ? 'bg-teal-deep text-white shadow-md scale-105'   : ''}
                      ${isFuture   ? 'opacity-25 cursor-default'                     : 'hover:bg-teal-ghost cursor-pointer'}
                      ${!isToday && !isSelected && !isFuture ? 'text-charcoal' : ''}
                      ${isSelected ? 'text-white' : isToday ? 'text-teal-deep' : ''}`}>
                    <span className="leading-none">{day}</span>
                    {/* Activity dots */}
                    {!isFuture && (hasMood || hasSleep) && (
                      <div className="flex gap-0.5 mt-1 absolute bottom-1">
                        {hasMood  && <span className={`w-1.5 h-1.5 rounded-full ${MOOD_COLORS[dayData!.mood!] ?? 'bg-teal-mid'}`} />}
                        {hasSleep && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-teal-light text-[0.7rem] text-text-xlight">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-mid" />Mood logged</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />Sleep logged</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border-2 border-teal-deep" />Today</span>
            </div>
          </div>

          {/* Day detail panel */}
          <div className="space-y-4">
            {selected && selectedDay ? (
              <div className="bg-white rounded-[22px] p-5 shadow-card border border-teal-light">
                <h3 className="font-display font-bold text-charcoal text-[1rem] mb-4">
                  {new Date(selected + 'T12:00').toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })}
                </h3>
                <div className="space-y-3">
                  {selectedDay.mood && (
                    <div className="flex items-center gap-3 bg-teal-ghost rounded-[12px] px-4 py-3">
                      <span className="text-[1.4rem]">📊</span>
                      <div>
                        <p className="font-semibold text-charcoal text-[0.85rem]">Mood</p>
                        <div className="flex gap-1 mt-0.5">
                          {[1,2,3,4,5].map(n => (
                            <span key={n} className={`w-3 h-3 rounded-full ${n <= selectedDay.mood! ? MOOD_COLORS[selectedDay.mood!] : 'bg-teal-light'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedDay.sleep && (
                    <div className="flex items-center gap-3 bg-blue-50 rounded-[12px] px-4 py-3">
                      <span className="text-[1.4rem]">🌙</span>
                      <div>
                        <p className="font-semibold text-charcoal text-[0.85rem]">Sleep</p>
                        <p className="text-text-xlight text-[0.75rem]">
                          {Math.floor(selectedDay.sleep.durationMins / 60)}h {selectedDay.sleep.durationMins % 60}m · Quality {selectedDay.sleep.quality}/5
                        </p>
                      </div>
                    </div>
                  )}
                  {!selectedDay.mood && !selectedDay.sleep && (
                    <p className="text-text-xlight text-[0.85rem] text-center py-4">No data for this day.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[22px] p-5 shadow-card border border-teal-light text-center">
                <span className="text-[2rem] block mb-2">👆</span>
                <p className="text-text-xlight text-[0.85rem]">Click any day to see your wellness data for that day.</p>
              </div>
            )}

            {/* Monthly summary */}
            <div className="bg-white rounded-[22px] p-5 shadow-card border border-teal-light">
              <h3 className="font-semibold text-charcoal text-[0.9rem] mb-4">This Month</h3>
              {(() => {
                const monthDays = Object.values(data).filter(d => d.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`))
                const moodDays  = monthDays.filter(d => d.mood)
                const sleepDays = monthDays.filter(d => d.sleep)
                const avgMood   = moodDays.length  ? (moodDays.reduce((a,d)=>a+d.mood!,0)/moodDays.length).toFixed(1)  : '—'
                const avgSleep  = sleepDays.length ? (sleepDays.reduce((a,d)=>a+d.sleep!.durationMins,0)/sleepDays.length/60).toFixed(1) : '—'
                return (
                  <div className="space-y-3">
                    <div className="flex justify-between text-[0.82rem]">
                      <span className="text-text-mid">Days with mood log</span>
                      <span className="font-bold text-charcoal">{moodDays.length}</span>
                    </div>
                    <div className="flex justify-between text-[0.82rem]">
                      <span className="text-text-mid">Average mood</span>
                      <span className="font-bold text-charcoal">{avgMood}/5</span>
                    </div>
                    <div className="flex justify-between text-[0.82rem]">
                      <span className="text-text-mid">Nights tracked</span>
                      <span className="font-bold text-charcoal">{sleepDays.length}</span>
                    </div>
                    <div className="flex justify-between text-[0.82rem]">
                      <span className="text-text-mid">Avg sleep duration</span>
                      <span className="font-bold text-charcoal">{avgSleep}h</span>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Quick log links */}
            <div className="bg-teal-ghost border border-teal-light rounded-[18px] p-4">
              <p className="text-teal-deep font-semibold text-[0.82rem] mb-3">Log today&apos;s data</p>
              <div className="flex flex-col gap-2">
                {[
                  { href: '/mood',    icon: '📊', label: 'Log Mood'    },
                  { href: '/sleep',   icon: '🌙', label: 'Log Sleep'   },
                  { href: '/journal', icon: '📓', label: 'Write Journal'},
                  { href: '/habits',  icon: '🎯', label: 'Habit Check-in'},
                ].map(l => (
                  <Link key={l.href} href={l.href}
                    className="flex items-center gap-2 text-[0.82rem] text-teal-deep font-medium hover:text-teal-dark no-underline transition-colors">
                    <span>{l.icon}</span>{l.label} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
