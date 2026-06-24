'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface WhatWorked {
  activity:    string
  icon:        string
  rate:        number
  sampleCount: number
}

export function WhatWorkedCard() {
  const { status } = useSession()
  const [data,    setData]    = useState<WhatWorked | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== 'authenticated') { setLoading(false); return }
    fetch('/api/insights/what-worked')
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [status])

  if (loading || !data) return null

  return (
    <div className="bg-gradient-to-br from-[#fffdf5] to-[#f0faf8] border border-amber/30 rounded-[18px] px-4 py-4">
      <p className="text-[0.65rem] font-bold text-amber uppercase tracking-widest mb-2">💡 Your personal insight</p>
      <div className="flex items-center gap-3">
        <span className="text-[2.2rem] flex-shrink-0">{data.icon}</span>
        <div>
          <p className="font-bold text-charcoal text-[0.92rem] leading-snug">
            {data.activity} helps you most when you&apos;re feeling low
          </p>
          <p className="text-text-xlight text-[0.75rem] mt-0.5">
            Your mood improved {data.rate}% of the time after {data.activity.toLowerCase()}
            {' '}on a tough day <span className="text-teal-mid">({data.sampleCount} instances)</span>
          </p>
        </div>
      </div>
    </div>
  )
}
