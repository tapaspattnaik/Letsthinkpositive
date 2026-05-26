export interface BadgeDef {
  slug:        string
  name:        string
  description: string
  icon:        string
  tier:        'bronze' | 'silver' | 'gold' | 'platinum'
  challenge?:  string   // challengeSlug that awards this badge
}

export const BADGES: BadgeDef[] = [
  // ── Challenge badges ─────────────────────────────────────────────────
  {
    slug:        'movement-7',
    name:        '7-Day Mover',
    description: 'Completed the 7 Days of Gentle Movement challenge.',
    icon:        '🏃',
    tier:        'bronze',
    challenge:   'gentle-movement-7',
  },
  {
    slug:        'mindfulness-7',
    name:        'Morning Mind',
    description: 'Completed the 7-Day Morning Mindfulness challenge.',
    icon:        '🧘',
    tier:        'bronze',
    challenge:   'morning-mindfulness-7',
  },
  {
    slug:        'gratitude-14',
    name:        'Grateful Heart',
    description: 'Completed the 14-Day Gratitude Journaling challenge.',
    icon:        '📓',
    tier:        'bronze',
    challenge:   'gratitude-journaling-14',
  },
  {
    slug:        'affirmation-21',
    name:        'I Am Enough',
    description: 'Completed the 21-Day Affirmation Practice challenge.',
    icon:        '✨',
    tier:        'silver',
    challenge:   'affirmation-21',
  },
  {
    slug:        'sleep-21',
    name:        'Deep Sleeper',
    description: 'Completed the 21-Day Sleep Reset challenge.',
    icon:        '🌙',
    tier:        'silver',
    challenge:   'sleep-reset-21',
  },
  {
    slug:        'gratitude-30',
    name:        'Gratitude Master',
    description: 'Completed the 30-Day Gratitude Challenge — a full month of thankfulness.',
    icon:        '🌟',
    tier:        'gold',
    challenge:   'gratitude-30',
  },

  // ── Community & profile badges ────────────────────────────────────────
  {
    slug:        'first-post',
    name:        'Story Sharer',
    description: 'Published your first community post.',
    icon:        '💬',
    tier:        'bronze',
  },
  {
    slug:        'early-adopter',
    name:        'Early Believer',
    description: 'One of the first 100 members to join letsthinkpositive.',
    icon:        '🌱',
    tier:        'gold',
  },
  {
    slug:        'streak-7',
    name:        'Week Warrior',
    description: 'Logged in 7 days in a row.',
    icon:        '🔥',
    tier:        'bronze',
  },
  {
    slug:        'streak-30',
    name:        'Unstoppable',
    description: 'Logged in 30 days in a row. You showed up every single day.',
    icon:        '💪',
    tier:        'platinum',
  },
]

export const TIER_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  bronze:   { bg: 'bg-[#f5e6d3]', border: 'border-[#c8854a]', text: 'text-[#8B4513]', label: 'Bronze'   },
  silver:   { bg: 'bg-[#e8edf2]', border: 'border-[#8fa3b1]', text: 'text-[#4a6070]', label: 'Silver'   },
  gold:     { bg: 'bg-amber-pale', border: 'border-amber',     text: 'text-[#8a5f00]', label: 'Gold'     },
  platinum: { bg: 'bg-teal-ghost', border: 'border-teal-mid',  text: 'text-teal-deep', label: 'Platinum' },
}
