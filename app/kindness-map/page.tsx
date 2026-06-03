'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ComposableMap, Geographies, Geography, Marker } = require('react-simple-maps')

// Natural Earth GeoJSON — free, built into react-simple-maps
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// ─── Types ────────────────────────────────────────────────────────────────────

interface KindnessAct {
  id: number
  act: string
  city: string
  country: string
  lat: number
  lng: number
  createdAt: string
}

// ─── City presets ─────────────────────────────────────────────────────────────

const CITY_PRESETS = [
  { label: 'Mumbai, India',           city: 'Mumbai',        country: 'India',          lat: 19.076,   lng: 72.877  },
  { label: 'Delhi, India',            city: 'Delhi',         country: 'India',          lat: 28.614,   lng: 77.209  },
  { label: 'London, UK',              city: 'London',        country: 'United Kingdom', lat: 51.507,   lng: -0.127  },
  { label: 'New York, USA',           city: 'New York',      country: 'United States',  lat: 40.713,   lng: -74.006 },
  { label: 'Sydney, Australia',       city: 'Sydney',        country: 'Australia',      lat: -33.868,  lng: 151.209 },
  { label: 'Tokyo, Japan',            city: 'Tokyo',         country: 'Japan',          lat: 35.690,   lng: 139.692 },
  { label: 'Toronto, Canada',         city: 'Toronto',       country: 'Canada',         lat: 43.651,   lng: -79.347 },
  { label: 'Singapore',               city: 'Singapore',     country: 'Singapore',      lat: 1.352,    lng: 103.820 },
  { label: 'Dubai, UAE',              city: 'Dubai',         country: 'UAE',            lat: 25.204,   lng: 55.271  },
  { label: 'Nairobi, Kenya',          city: 'Nairobi',       country: 'Kenya',          lat: -1.286,   lng: 36.817  },
  { label: 'São Paulo, Brazil',       city: 'São Paulo',     country: 'Brazil',         lat: -23.550,  lng: -46.633 },
  { label: 'Cape Town, South Africa', city: 'Cape Town',     country: 'South Africa',   lat: -33.924,  lng: 18.424  },
  { label: 'Paris, France',           city: 'Paris',         country: 'France',         lat: 48.857,   lng: 2.352   },
  { label: 'Berlin, Germany',         city: 'Berlin',        country: 'Germany',        lat: 52.520,   lng: 13.405  },
  { label: 'Bangkok, Thailand',       city: 'Bangkok',       country: 'Thailand',       lat: 13.756,   lng: 100.502 },
  { label: 'Lagos, Nigeria',          city: 'Lagos',         country: 'Nigeria',        lat: 6.524,    lng: 3.379   },
  { label: 'Karachi, Pakistan',       city: 'Karachi',       country: 'Pakistan',       lat: 24.861,   lng: 67.010  },
  { label: 'Jakarta, Indonesia',      city: 'Jakarta',       country: 'Indonesia',      lat: -6.208,   lng: 106.846 },
  { label: 'Mexico City, Mexico',     city: 'Mexico City',   country: 'Mexico',         lat: 19.433,   lng: -99.133 },
  { label: 'Cairo, Egypt',            city: 'Cairo',         country: 'Egypt',          lat: 30.044,   lng: 31.236  },
  { label: 'Buenos Aires, Argentina', city: 'Buenos Aires',  country: 'Argentina',      lat: -34.603,  lng: -58.381 },
  { label: 'Istanbul, Turkey',        city: 'Istanbul',      country: 'Turkey',         lat: 41.015,   lng: 28.979  },
  { label: 'Seoul, South Korea',      city: 'Seoul',         country: 'South Korea',    lat: 37.566,   lng: 126.978 },
  { label: 'Los Angeles, USA',        city: 'Los Angeles',   country: 'United States',  lat: 34.052,   lng: -118.244},
  { label: 'Bangalore, India',        city: 'Bangalore',     country: 'India',          lat: 12.972,   lng: 77.595  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function latLngToPercent(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 100
  const y = ((90 - lat) / 180) * 100
  return { x, y }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function todayCount(acts: KindnessAct[]) {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  return acts.filter(a => new Date(a.createdAt) >= todayStart).length
}

// ─── Grid lines SVG overlay ───────────────────────────────────────────────────

function GridLines() {
  const lats  = [-60, -30, 0, 30, 60]
  const lngs  = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150]

  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      {lats.map(lat => {
        const y = ((90 - lat) / 180) * 100
        return (
          <line
            key={`lat${lat}`}
            x1="0%" y1={`${y}%`} x2="100%" y2={`${y}%`}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            strokeDasharray={lat === 0 ? '4 4' : '2 6'}
          />
        )
      })}
      {lngs.map(lng => {
        const x = ((lng + 180) / 360) * 100
        return (
          <line
            key={`lng${lng}`}
            x1={`${x}%`} y1="0%" x2={`${x}%`} y2="100%"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            strokeDasharray={lng === 0 ? '4 4' : '2 6'}
          />
        )
      })}
      {/* equator label */}
      <text x="1%" y="50%" dy="-4" fontSize="9" fill="rgba(255,255,255,0.18)" fontFamily="DM Sans, sans-serif">Equator</text>
    </svg>
  )
}

// ─── Single dot ───────────────────────────────────────────────────────────────

interface DotProps {
  act: KindnessAct
  index: number
}

function KindnessDot({ act, index }: DotProps) {
  const [hovered, setHovered] = useState(false)
  const { x, y } = latLngToPercent(act.lat, act.lng)

  // Stagger the animation delay so dots don't all pulse together
  const delay = (index % 8) * 0.4

  return (
    <div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', zIndex: hovered ? 30 : 10 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pulse ring */}
      <span
        className="absolute rounded-full"
        style={{
          width: 24,
          height: 24,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(232,160,32,0.25)',
          animation: `kindness-pulse 2.4s ease-out infinite`,
          animationDelay: `${delay}s`,
          pointerEvents: 'none',
        }}
      />
      {/* Core dot */}
      <span
        className="block rounded-full cursor-pointer"
        style={{
          width: 8,
          height: 8,
          background: '#E8A020',
          boxShadow: hovered
            ? '0 0 0 3px rgba(232,160,32,0.5), 0 0 14px rgba(232,160,32,0.8)'
            : '0 0 6px rgba(232,160,32,0.7)',
          transition: 'box-shadow 0.2s',
          opacity: 0.92,
        }}
      />

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 240,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          <div
            className="rounded-xl px-3 py-2 text-xs shadow-xl"
            style={{
              background: 'rgba(15,64,64,0.97)',
              border: '1px solid rgba(168,216,208,0.3)',
              backdropFilter: 'blur(8px)',
              minWidth: 160,
              maxWidth: 240,
            }}
          >
            <p className="font-semibold text-[#A8D8D0] mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {act.city}, {act.country}
            </p>
            <p className="text-[#F8F8F4] leading-snug" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {act.act}
            </p>
            <p className="text-[#A8D8D0] mt-1 opacity-70" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {timeAgo(act.createdAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function KindnessMapPage() {
  const [acts, setActs] = useState<KindnessAct[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Form state
  const [actText, setActText]       = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [customCity, setCustomCity] = useState('')
  const [customCountry, setCustomCountry] = useState('')
  const [customLat, setCustomLat]   = useState('')
  const [customLng, setCustomLng]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg]   = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const useCustom = selectedCity === '__custom__'

  const fetchActs = useCallback(async () => {
    try {
      const res = await fetch('/api/kindness-map')
      const data = await res.json()
      setActs(data.acts ?? [])
      setTotal(data.total ?? 0)
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActs()
  }, [fetchActs])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!actText.trim()) return

    let city = '', country = '', lat = 0, lng = 0

    if (useCustom) {
      city    = customCity.trim()
      country = customCountry.trim()
      lat     = parseFloat(customLat)
      lng     = parseFloat(customLng)
    } else {
      const preset = CITY_PRESETS.find(p => p.label === selectedCity)
      if (!preset) { setSubmitMsg({ type: 'err', text: 'Please choose a city.' }); return }
      city    = preset.city
      country = preset.country
      lat     = preset.lat
      lng     = preset.lng
    }

    if (!city || !country || isNaN(lat) || isNaN(lng)) {
      setSubmitMsg({ type: 'err', text: 'Please fill in city, country and coordinates.' })
      return
    }

    setSubmitting(true)
    setSubmitMsg(null)
    try {
      const res = await fetch('/api/kindness-map', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ act: actText, city, country, lat, lng }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitMsg({ type: 'err', text: data.error ?? 'Something went wrong.' })
      } else {
        setSubmitMsg({ type: 'ok', text: 'Your act of kindness is on the map! 🌍' })
        setActText('')
        setSelectedCity('')
        setCustomCity('')
        setCustomCountry('')
        setCustomLat('')
        setCustomLng('')
        await fetchActs()
      }
    } catch {
      setSubmitMsg({ type: 'err', text: 'Network error. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const todayTotal = todayCount(acts)
  const recent10   = acts.slice(0, 10)

  return (
    <>
      {/* Inline keyframes for dot pulse */}
      <style>{`
        @keyframes kindness-pulse {
          0%   { transform: translate(-50%, -50%) scale(0.6); opacity: 0.8; }
          70%  { transform: translate(-50%, -50%) scale(2.2); opacity: 0;   }
          100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0;   }
        }
      `}</style>

      <main
        className="min-h-screen pt-24 pb-20 px-4"
        style={{ background: 'linear-gradient(160deg, #0F4040 0%, #1A6B6B 50%, #0F4040 100%)' }}
      >
        {/* ── Hero ── */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <p className="text-4xl mb-3">🌍</p>
          <h1
            className="text-4xl md:text-5xl font-bold mb-3"
            style={{ fontFamily: 'Playfair Display, serif', color: '#F8F8F4' }}
          >
            The Kindness Map
          </h1>
          <p
            className="text-lg mb-5"
            style={{ fontFamily: 'DM Sans, sans-serif', color: '#A8D8D0' }}
          >
            Real acts of kindness. Real people. Everywhere.
          </p>

          {/* Live counter pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <span
              className="px-4 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: 'rgba(232,160,32,0.18)', color: '#F5C96A', border: '1px solid rgba(232,160,32,0.35)', fontFamily: 'DM Sans, sans-serif' }}
            >
              {loading ? '…' : `${todayTotal} kind act${todayTotal !== 1 ? 's' : ''} logged today`}
            </span>
            <span
              className="px-4 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: 'rgba(45,155,138,0.18)', color: '#A8D8D0', border: '1px solid rgba(45,155,138,0.35)', fontFamily: 'DM Sans, sans-serif' }}
            >
              {loading ? '…' : `${total.toLocaleString()} total acts worldwide`}
            </span>
          </div>
        </div>

        {/* ── Map container ── */}
        <div className="max-w-[1000px] mx-auto mb-12">
          <div
            className="relative overflow-hidden rounded-[24px] w-full"
            style={{
              background: '#0a2a2a',
              boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,216,208,0.15)',
            }}
          >
            {/* Proper world map using react-simple-maps */}
            <ComposableMap
              projection="geoNaturalEarth1"
              projectionConfig={{ scale: 160, center: [0, 10] }}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            >
              {/* Ocean background */}
              <rect x={-800} y={-600} width={2400} height={1200} fill="#0d3535" />

              <Geographies geography={GEO_URL}>
                {({ geographies }: { geographies: any[] }) =>
                  geographies.map((geo: any) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: { fill: '#1a5050', stroke: '#2D9B8A', strokeWidth: 0.4, outline: 'none' },
                        hover:   { fill: '#206060', stroke: '#2D9B8A', strokeWidth: 0.6, outline: 'none' },
                        pressed: { fill: '#1a5050', outline: 'none' },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Kindness dots as SVG markers */}
              {acts.map((act, i) => (
                <Marker key={act.id} coordinates={[act.lng, act.lat]}>
                  <circle r={6} fill="rgba(232,160,32,0.25)" />
                  <circle r={4} fill="#E8A020" opacity={0.9}>
                    <animate attributeName="r" from="4" to="10" dur="2s" begin={`${(i % 6) * 0.4}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.9" to="0" dur="2s" begin={`${(i % 6) * 0.4}s`} repeatCount="indefinite" />
                  </circle>
                  <circle r={3.5} fill="#F5C96A" />
                  <title>{act.city}, {act.country}: {act.act}</title>
                </Marker>
              ))}
            </ComposableMap>

            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a2a2a]/80">
                <p className="text-sm animate-pulse" style={{ color: '#A8D8D0', fontFamily: 'DM Sans, sans-serif' }}>
                  Loading acts of kindness…
                </p>
              </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(15,64,64,0.85)', border: '1px solid rgba(168,216,208,0.2)', backdropFilter: 'blur(6px)' }}>
              <span className="block rounded-full" style={{ width: 8, height: 8, background: '#E8A020', boxShadow: '0 0 6px rgba(232,160,32,0.8)' }} />
              <span className="text-[11px]" style={{ color: '#A8D8D0', fontFamily: 'DM Sans, sans-serif' }}>= one act of kindness</span>
            </div>

            {/* Count overlay */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-[11px]"
              style={{ background: 'rgba(15,64,64,0.85)', border: '1px solid rgba(168,216,208,0.2)', color: '#A8D8D0', fontFamily: 'DM Sans, sans-serif' }}>
              {acts.length} acts on the map
            </div>
          </div>

          <p
            className="text-center mt-3 text-sm opacity-60"
            style={{ color: '#A8D8D0', fontFamily: 'DM Sans, sans-serif' }}
          >
            You are looking at {acts.length} act{acts.length !== 1 ? 's' : ''} of kindness from around the world.
            Hover any dot to read the story.
          </p>
        </div>

        {/* ── Two-column layout for form + recent acts ── */}
        <div className="max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ── Submit form ── */}
          <div
            className="rounded-[20px] p-6"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(168,216,208,0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <h2
              className="text-xl font-bold mb-1"
              style={{ fontFamily: 'Playfair Display, serif', color: '#F8F8F4' }}
            >
              Log a kind act 💛
            </h2>
            <p className="text-sm mb-5 opacity-70" style={{ color: '#A8D8D0', fontFamily: 'DM Sans, sans-serif' }}>
              What kind thing did you do or witness today?
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Act textarea */}
              <div>
                <textarea
                  value={actText}
                  onChange={e => setActText(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="e.g. I bought coffee for the person behind me in the queue…"
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(168,216,208,0.25)',
                    color: '#F8F8F4',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                  required
                />
                <p className="text-right text-xs mt-1 opacity-50" style={{ color: '#A8D8D0', fontFamily: 'DM Sans, sans-serif' }}>
                  {actText.length}/200
                </p>
              </div>

              {/* City select */}
              <div>
                <label className="block text-xs mb-1.5 font-semibold" style={{ color: '#A8D8D0', fontFamily: 'DM Sans, sans-serif' }}>
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    background: 'rgba(15,64,64,0.9)',
                    border: '1px solid rgba(168,216,208,0.25)',
                    color: selectedCity ? '#F8F8F4' : '#A8D8D0',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                  required
                >
                  <option value="" disabled>Select your city…</option>
                  {CITY_PRESETS.map(p => (
                    <option key={p.label} value={p.label}>{p.label}</option>
                  ))}
                  <option value="__custom__">Other city (enter manually)</option>
                </select>
              </div>

              {/* Custom fields */}
              {useCustom && (
                <div className="flex flex-col gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,216,208,0.1)' }}>
                  <p className="text-xs opacity-60" style={{ color: '#A8D8D0', fontFamily: 'DM Sans, sans-serif' }}>
                    Enter your city's approximate centre coordinates (privacy-safe — city level only).
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1 font-semibold" style={{ color: '#A8D8D0', fontFamily: 'DM Sans, sans-serif' }}>City name</label>
                      <input
                        type="text"
                        value={customCity}
                        onChange={e => setCustomCity(e.target.value)}
                        placeholder="e.g. Osaka"
                        maxLength={100}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(168,216,208,0.2)', color: '#F8F8F4', fontFamily: 'DM Sans, sans-serif' }}
                        required={useCustom}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 font-semibold" style={{ color: '#A8D8D0', fontFamily: 'DM Sans, sans-serif' }}>Country</label>
                      <input
                        type="text"
                        value={customCountry}
                        onChange={e => setCustomCountry(e.target.value)}
                        placeholder="e.g. Japan"
                        maxLength={100}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(168,216,208,0.2)', color: '#F8F8F4', fontFamily: 'DM Sans, sans-serif' }}
                        required={useCustom}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 font-semibold" style={{ color: '#A8D8D0', fontFamily: 'DM Sans, sans-serif' }}>Latitude</label>
                      <input
                        type="number"
                        value={customLat}
                        onChange={e => setCustomLat(e.target.value)}
                        placeholder="34.69"
                        step="any"
                        min="-90"
                        max="90"
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(168,216,208,0.2)', color: '#F8F8F4', fontFamily: 'DM Sans, sans-serif' }}
                        required={useCustom}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 font-semibold" style={{ color: '#A8D8D0', fontFamily: 'DM Sans, sans-serif' }}>Longitude</label>
                      <input
                        type="number"
                        value={customLng}
                        onChange={e => setCustomLng(e.target.value)}
                        placeholder="135.50"
                        step="any"
                        min="-180"
                        max="180"
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(168,216,208,0.2)', color: '#F8F8F4', fontFamily: 'DM Sans, sans-serif' }}
                        required={useCustom}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {submitMsg && (
                <p
                  className="text-sm rounded-lg px-4 py-2"
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    background: submitMsg.type === 'ok' ? 'rgba(45,155,138,0.2)' : 'rgba(220,60,60,0.15)',
                    color:      submitMsg.type === 'ok' ? '#A8D8D0'              : '#f87171',
                    border:     `1px solid ${submitMsg.type === 'ok' ? 'rgba(45,155,138,0.35)' : 'rgba(220,60,60,0.3)'}`,
                  }}
                >
                  {submitMsg.text}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !actText.trim()}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                style={{
                  background: submitting ? 'rgba(232,160,32,0.5)' : 'linear-gradient(135deg, #E8A020, #F5C96A)',
                  color: '#0F4040',
                  fontFamily: 'DM Sans, sans-serif',
                  boxShadow: '0 4px 16px rgba(232,160,32,0.3)',
                }}
              >
                {submitting ? 'Adding…' : 'Add to the map 🌍'}
              </button>
            </form>
          </div>

          {/* ── Recent acts ── */}
          <div>
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: 'Playfair Display, serif', color: '#F8F8F4' }}
            >
              Recent acts ✨
            </h2>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                ))}
              </div>
            ) : recent10.length === 0 ? (
              <p className="text-sm opacity-60" style={{ color: '#A8D8D0', fontFamily: 'DM Sans, sans-serif' }}>
                No acts yet — be the first!
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {recent10.map(act => (
                  <div
                    key={act.id}
                    className="rounded-xl px-4 py-3 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(168,216,208,0.12)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: '#F5C96A', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        📍 {act.city}, {act.country}
                      </span>
                      <span
                        className="text-xs opacity-50 shrink-0"
                        style={{ color: '#A8D8D0', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {timeAgo(act.createdAt)}
                      </span>
                    </div>
                    <p
                      className="text-sm leading-snug"
                      style={{ color: '#F8F8F4', fontFamily: 'DM Sans, sans-serif' }}
                    >
                      {act.act}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
