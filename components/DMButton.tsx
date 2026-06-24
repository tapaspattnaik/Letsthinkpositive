'use client'

import { openDM } from '@/components/MessagesWidget'

interface Props {
  userId:   number
  name:     string
  avatar?:  string | null
  variant?: 'icon' | 'pill'
}

export function DMButton({ userId, name, avatar, variant = 'icon' }: Props) {
  const handleClick = () => openDM(userId, name, avatar)

  if (variant === 'pill') {
    return (
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-teal-mid text-teal-deep text-[0.82rem] font-semibold hover:bg-teal-ghost transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        Message
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      title={`Message ${name}`}
      className="w-8 h-8 rounded-full border border-teal-light bg-white flex items-center justify-center text-teal-deep hover:bg-teal-ghost hover:border-teal-mid transition-colors flex-shrink-0"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    </button>
  )
}
