'use client'
// This component is ONLY imported via next/dynamic with ssr:false
// so react-simple-maps never runs during server-side rendering.

import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'

const GEO_URL = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json'

interface KindnessAct {
  id: number; act: string; city: string; country: string; lat: number; lng: number; createdAt: string
}

interface Props {
  acts: KindnessAct[]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day:'numeric', month:'short' })
}

export default function WorldMap({ acts }: Props) {
  const [tooltip, setTooltip] = useState<{ act: KindnessAct; x: number; y: number } | null>(null)

  return (
    <div className="relative w-full" style={{ background: '#0a2a2a', borderRadius: '24px', overflow: 'hidden' }}>
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 155, center: [10, 5] }}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <ZoomableGroup zoom={1}>
          {/* Ocean */}
          <rect x={-2000} y={-1000} width={5000} height={3000} fill="#0d3535" />

          {/* Countries */}
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: '#1a5555', stroke: '#2D9B8A', strokeWidth: 0.4, outline: 'none' },
                    hover:   { fill: '#22666', stroke: '#4DB8A8', strokeWidth: 0.6, outline: 'none' },
                    pressed: { fill: '#1a5555', outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Kindness dots */}
          {acts.map((act, i) => (
            <Marker
              key={act.id}
              coordinates={[act.lng, act.lat]}
              onMouseEnter={(e) => {
                const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect()
                const cx = (e.clientX - (rect?.left ?? 0))
                const cy = (e.clientY - (rect?.top ?? 0))
                setTooltip({ act, x: cx, y: cy })
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Pulse ring */}
              <circle r={10} fill="rgba(232,160,32,0)" stroke="rgba(232,160,32,0.4)" strokeWidth={1.5}>
                <animate attributeName="r" from="4" to="14" dur="2.5s" begin={`${(i % 8) * 0.35}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.7" to="0" dur="2.5s" begin={`${(i % 8) * 0.35}s`} repeatCount="indefinite" />
              </circle>
              {/* Core dot */}
              <circle r={4} fill="#E8A020" stroke="#FFF8EC" strokeWidth={1} style={{ cursor: 'pointer' }} />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left:      Math.min(tooltip.x + 12, 9999),
            top:       Math.max(tooltip.y - 80, 8),
            maxWidth:  240,
            transform: tooltip.x > 600 ? 'translateX(-110%)' : 'none',
          }}
        >
          <div style={{
            background: 'rgba(10,42,42,0.96)',
            border: '1px solid rgba(45,155,138,0.4)',
            borderRadius: 12,
            padding: '10px 14px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <p style={{ color: '#A8D8D0', fontWeight: 700, fontSize: 12, marginBottom: 4, fontFamily: 'DM Sans,sans-serif' }}>
              📍 {tooltip.act.city}, {tooltip.act.country}
            </p>
            <p style={{ color: '#F8F8F4', fontSize: 13, lineHeight: 1.5, fontFamily: 'DM Sans,sans-serif', maxWidth: 200 }}>
              {tooltip.act.act}
            </p>
            <p style={{ color: '#A8D8D0', fontSize: 11, marginTop: 6, opacity: 0.7, fontFamily: 'DM Sans,sans-serif' }}>
              {timeAgo(tooltip.act.createdAt)}
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 12, right: 12,
        background: 'rgba(10,42,42,0.88)',
        border: '1px solid rgba(168,216,208,0.2)',
        borderRadius: 20, padding: '6px 12px',
        display: 'flex', alignItems: 'center', gap: 8,
        backdropFilter: 'blur(6px)',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8A020', display: 'inline-block', boxShadow: '0 0 6px rgba(232,160,32,0.8)' }} />
        <span style={{ color: '#A8D8D0', fontSize: 11, fontFamily: 'DM Sans,sans-serif' }}>= one act of kindness</span>
      </div>

      {/* Act count */}
      <div style={{
        position: 'absolute', top: 12, left: 12,
        background: 'rgba(10,42,42,0.88)',
        border: '1px solid rgba(168,216,208,0.2)',
        borderRadius: 20, padding: '5px 12px',
        backdropFilter: 'blur(6px)',
      }}>
        <span style={{ color: '#A8D8D0', fontSize: 11, fontFamily: 'DM Sans,sans-serif' }}>
          🌍 {acts.length} acts on the map
        </span>
      </div>
    </div>
  )
}
