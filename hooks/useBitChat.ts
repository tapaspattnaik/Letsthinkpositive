'use client'

import { useState, useRef, useCallback } from 'react'

export interface Message { role: 'user' | 'assistant'; content: string }

export function useBitChat() {
  const [messages,  setMessages]  = useState<Message[]>([])
  const [mood,      setMood]      = useState('')
  const [streaming, setStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(async (userText: string) => {
    const content = userText.trim()
    if (!content || streaming) return

    const userMsg: Message = { role: 'user', content }

    // Capture current messages before state update
    setMessages(prev => {
      const next = [...prev, userMsg, { role: 'assistant' as const, content: '' }]
      return next
    })
    setStreaming(true)

    // We need a fresh snapshot of messages — use functional update pattern
    // to pass the correct history to the API
    const historySnapshot = await new Promise<Message[]>(resolve => {
      setMessages(prev => {
        // Remove the two we just added — they haven't been sent yet
        const history = prev.slice(0, prev.length - 2)
        resolve(history)
        return prev // no change
      })
    })

    const allMessages = [...historySnapshot, userMsg]

    const abort = new AbortController()
    abortRef.current = abort

    try {
      const res = await fetch('/api/advisor', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: allMessages, mood }),
        signal:  abort.signal,
      })

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer      = ''
      let accumulated = ''

      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Split on newlines, keep any incomplete final line in buffer
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue

          const payload = trimmed.slice(6)
          if (payload === '[DONE]') break outer

          try {
            const parsed = JSON.parse(payload)
            // Support both { text: "..." } and { choices: [{ delta: { content } }] }
            const chunk: string =
              parsed.text ??
              parsed.choices?.[0]?.delta?.content ??
              ''
            if (chunk) {
              accumulated += chunk
              const snap = accumulated
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: snap }
                return updated
              })
            }
          } catch { /* malformed chunk — skip */ }
        }
      }

      // If nothing came through, show a graceful fallback
      if (!accumulated) {
        setMessages(prev => {
          const u = [...prev]
          u[u.length - 1] = {
            role: 'assistant',
            content: "I'm here, though I had a moment of silence there. Want to try again?",
          }
          return u
        })
      }
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return
      setMessages(prev => {
        const u = [...prev]
        u[u.length - 1] = {
          role: 'assistant',
          content: "Something went wrong on my end. I'm still here — please try again in a moment.",
        }
        return u
      })
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [streaming, mood])

  function clear() {
    abortRef.current?.abort()
    setMessages([])
    setStreaming(false)
  }

  return { messages, mood, setMood, streaming, send, clear }
}
