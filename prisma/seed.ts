import { PrismaClient } from '@prisma/client'
import { BADGES } from '../lib/badges'

const prisma = new PrismaClient()

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

  console.log(`\n✅ Seeded ${BADGES.length} badges.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
