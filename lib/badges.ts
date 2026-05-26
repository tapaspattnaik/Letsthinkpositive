export interface BadgeDef {
  slug:        string
  name:        string
  description: string
  icon:        string
  tier:        'bronze' | 'silver' | 'gold' | 'platinum'
  challenge?:  string   // matches challenge id in challenges page
  totalDays?:  number   // days needed to complete
}

export const BADGES: BadgeDef[] = [
  // ── Challenge badges — slugs match challenge ids in /challenges ───────
  {
    slug: 'movement-7', name: '7-Day Mover',
    description: 'Completed 7 Days of Gentle Movement.',
    icon: '🏃', tier: 'bronze', challenge: 'movement-7', totalDays: 7,
  },
  {
    slug: 'mindfulness-7', name: 'Morning Mind',
    description: 'Completed the 7-Day Morning Mindfulness challenge.',
    icon: '🧘', tier: 'bronze', challenge: 'mindfulness-7', totalDays: 7,
  },
  {
    slug: 'journal-14', name: 'Grateful Heart',
    description: 'Completed 14 Days of Gratitude Journaling.',
    icon: '📓', tier: 'bronze', challenge: 'journal-14', totalDays: 14,
  },
  {
    slug: 'affirmations-21', name: 'I Am Enough',
    description: 'Completed the 21-Day Affirmation Practice.',
    icon: '✨', tier: 'silver', challenge: 'affirmations-21', totalDays: 21,
  },
  {
    slug: 'sleep-21', name: 'Deep Sleeper',
    description: 'Completed the 21-Day Sleep Reset challenge.',
    icon: '🌙', tier: 'silver', challenge: 'sleep-21', totalDays: 21,
  },
  {
    slug: 'gratitude-30', name: 'Gratitude Master',
    description: 'Completed the 30-Day Gratitude Challenge — a full month of thankfulness.',
    icon: '🌟', tier: 'gold', challenge: 'gratitude-30', totalDays: 30,
  },
  // ── Community & profile badges ────────────────────────────────────────
  {
    slug: 'first-post', name: 'Story Sharer',
    description: 'Published your first community story.',
    icon: '💬', tier: 'bronze',
  },
  {
    slug: 'early-adopter', name: 'Early Believer',
    description: 'One of the first 100 members to join letsthinkpositive.',
    icon: '🌱', tier: 'gold',
  },
  {
    slug: 'streak-7', name: 'Week Warrior',
    description: 'Checked in 7 days in a row.',
    icon: '🔥', tier: 'bronze',
  },
  {
    slug: 'streak-30', name: 'Unstoppable',
    description: 'Showed up every day for 30 days straight.',
    icon: '💪', tier: 'platinum',
  },
]

export const BADGE_BY_CHALLENGE: Record<string, BadgeDef> = Object.fromEntries(
  BADGES.filter(b => b.challenge).map(b => [b.challenge!, b])
)

export const TIER_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  bronze:   { bg: 'bg-[#f5e6d3]', border: 'border-[#c8854a]', text: 'text-[#8B4513]', label: 'Bronze'   },
  silver:   { bg: 'bg-[#e8edf2]', border: 'border-[#8fa3b1]', text: 'text-[#4a6070]', label: 'Silver'   },
  gold:     { bg: 'bg-amber-pale', border: 'border-amber',     text: 'text-[#8a5f00]', label: 'Gold'     },
  platinum: { bg: 'bg-teal-ghost', border: 'border-teal-mid',  text: 'text-teal-deep', label: 'Platinum' },
}
