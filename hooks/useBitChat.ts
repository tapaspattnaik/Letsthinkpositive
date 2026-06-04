'use client'

import { useState, useRef, useCallback } from 'react'
import { useLanguage } from '@/context/LanguageContext'

export interface Message { role: 'user' | 'assistant'; content: string }

export function useBitChat() {
  const [messages,  setMessages]  = useState<Message[]>([])
  const [mood,      setMood]      = useState('')
  const [streaming, setStreaming] = useState(false)

  // Refs — keep stable, never stale, no re-render on update
  const { language } = useLanguage()   // live — updates when user changes language

  const messagesRef  = useRef<Message[]>([])
  const moodRef      = useRef('')
  const streamingRef = useRef(false)
  const abortRef     = useRef<AbortController | null>(null)
  const languageRef  = useRef(language)
  languageRef.current = language       // always current, no stale closure

  // Keep refs in sync with state
  const syncMessages = (next: Message[]) => {
    messagesRef.current = next
    setMessages(next)
  }

  const send = useCallback(async (userText: string) => {
    const content = userText.trim()
    if (!content || streamingRef.current) return

    // Build history using the ref — never stale, no async setMessages hack
    const history: Message[] = [...messagesRef.current, { role: 'user', content }]
    const withPlaceholder: Message[] = [...history, { role: 'assistant', content: '' }]

    streamingRef.current = true
    syncMessages(withPlaceholder)
    setStreaming(true)

    const abort = new AbortController()
    abortRef.current = abort

    let accumulated = ''

    try {
      const res = await fetch('/api/advisor', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
          mood:     moodRef.current,
          language: languageRef.current,
        }),
        signal: abort.signal,
      })

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue
          const payload = trimmed.slice(6)
          if (payload === '[DONE]') break outer
          try {
            const parsed = JSON.parse(payload)
            // Support both { text: "..." } (our SSE format) and raw OpenAI chunks
            const chunk: string =
              parsed.text ??
              parsed.choices?.[0]?.delta?.content ??
              ''
            if (chunk) {
              accumulated += chunk
              const snap = accumulated
              setMessages(prev => {
                const u = [...prev]
                u[u.length - 1] = { role: 'assistant', content: snap }
                return u
              })
            }
          } catch { /* skip malformed chunk */ }
        }
      }

      // Final sync to ref
      const finalMessages = withPlaceholder.map((m, i) =>
        i === withPlaceholder.length - 1
          ? { role: 'assistant' as const, content: accumulated || "I'm here — want to try again?" }
          : m
      )
      messagesRef.current = finalMessages
      if (!accumulated) setMessages(finalMessages)

    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        streamingRef.current = false
        setStreaming(false)
        abortRef.current = null
        return
      }
      console.error('Bit chat error:', err)
      const errorMessages = withPlaceholder.map((m, i) =>
        i === withPlaceholder.length - 1
          ? { role: 'assistant' as const, content: "Something went wrong on my end. I'm still here — please try again in a moment." }
          : m
      )
      messagesRef.current = errorMessages
      setMessages(errorMessages)
    } finally {
      streamingRef.current = false
      setStreaming(false)
      abortRef.current = null
    }
  }, []) // no deps — reads everything from refs

  // Keep moodRef in sync when setMood is called
  const handleSetMood = useCallback((m: string) => {
    moodRef.current = m
    setMood(m)
  }, [])

  function clear() {
    abortRef.current?.abort()
    messagesRef.current = []
    streamingRef.current = false
    setMessages([])
    setStreaming(false)
  }

  return { messages, mood, setMood: handleSetMood, streaming, send, clear }
}
