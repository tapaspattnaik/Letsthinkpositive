import { PrismaClient } from '@prisma/client'
import { BADGES } from '../lib/badges'

const prisma = new PrismaClient()

const CIRCLES = [
  {
    slug: 'gratitude-circle',
    name: 'Gratitude Circle',
    description: 'A warm, private space to share what you\'re grateful for — big things, tiny things, everyday moments. Members only.',
    icon: '🍂',
    color: 'from-amber/20 to-amber/5',
  },
  {
    slug: 'morning-light',
    name: 'Morning Light',
    description: 'For those building a mindful morning practice. Share your wins, routines, and those quiet moments before the world wakes up.',
    icon: '☀️',
    color: 'from-teal-ghost to-white',
  },
  {
    slug: 'sleep-sanctuary',
    name: 'Sleep Sanctuary',
    description: 'A gentle space to share sleep journey progress, bedtime rituals, and restful nights.',
    icon: '🌙',
    color: 'from-[#1A2B4A]/10 to-white',
  },
  {
    slug: 'growth-stories',
    name: 'Growth Stories',
    description: 'Celebrating small wins, breakthroughs, and the courage it takes to keep going. Share your progress, however small.',
    icon: '🌱',
    color: 'from-teal-ghost to-white',
  },
]

async function main() {
  console.log('🌱 Seeding badges…')
  for (const b of BADGES) {
    await prisma.badge.upsert({
      where:  { slug: b.slug },
      update: { name: b.name, description: b.description, icon: b.icon, tier: b.tier, challenge: b.challenge ?? null },
      create: { slug: b.slug, name: b.name, description: b.description, icon: b.icon, tier: b.tier, challenge: b.challenge ?? null },
    })
    console.log(`  ✓ ${b.icon}  ${b.name}  [${b.tier}]`)
  }

  console.log('\n🌱 Seeding circles…')
  for (const c of CIRCLES) {
    await prisma.circle.upsert({
      where:  { slug: c.slug },
      update: { name: c.name, description: c.description, icon: c.icon, color: c.color },
      create: { slug: c.slug, name: c.name, description: c.description, icon: c.icon, color: c.color, isPrivate: true },
    })
    console.log(`  ✓ ${c.icon}  ${c.name}`)
  }

  console.log(`\n✅ Done.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
