'use client'

import { useRef, useState } from 'react'

// ── Voice dictation button (Web Speech API) ─────────────────────────────────
// Free, on-device browser transcription — no audio leaves the machine.
// Renders nothing in unsupported browsers (Firefox). Parent gets the raw text.

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as Record<string, unknown>
  const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as (new () => SpeechRecognitionLike) | undefined
  return Ctor ? new Ctor() : null
}

export function VoiceDictation({
  onTranscript, disabled,
}: {
  onTranscript: (raw: string) => void
  disabled?: boolean
}) {
  const [recording, setRecording] = useState(false)
  const [supported] = useState(() => typeof window !== 'undefined' &&
    !!((window as unknown as Record<string, unknown>).SpeechRecognition ||
       (window as unknown as Record<string, unknown>).webkitSpeechRecognition))
  const recRef    = useRef<SpeechRecognitionLike | null>(null)
  const piecesRef = useRef<string[]>([])

  if (!supported) return null

  function stop() {
    recRef.current?.stop()
  }

  function start() {
    const rec = getRecognition()
    if (!rec) return
    piecesRef.current = []
    rec.lang = navigator.language || 'en-US'
    rec.continuous = true
    rec.interimResults = false

    rec.onresult = (event) => {
      const results = event.results
      for (let i = 0; i < results.length; i++) {
        const r = results[i]
        if (r.isFinal && r[0]?.transcript) piecesRef.current[i] = r[0].transcript
      }
    }
    rec.onend = () => {
      setRecording(false)
      const text = piecesRef.current.filter(Boolean).join(' ').trim()
      if (text) onTranscript(text)
      recRef.current = null
    }
    rec.onerror = () => { setRecording(false); recRef.current = null }

    recRef.current = rec
    setRecording(true)
    rec.start()
  }

  return (
    <button
      type="button"
      onClick={recording ? stop : start}
      disabled={disabled}
      aria-pressed={recording}
      aria-label={recording ? 'Stop recording' : 'Dictate with your voice'}
      title={recording ? 'Tap to stop' : 'Speak your entry instead of typing'}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[0.8rem] font-semibold border transition-all disabled:opacity-50
        ${recording
          ? 'bg-red-50 border-red-300 text-red-500 animate-pulse'
          : 'bg-teal-ghost border-teal-light text-teal-deep hover:border-teal-mid'}`}>
      {recording
        ? <><span className="w-2 h-2 rounded-full bg-red-500" /> Listening… tap to finish</>
        : <>🎤 Speak instead</>}
    </button>
  )
}
