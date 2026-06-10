// Runs `prisma db push` before the build, but only when a database is
// configured — i.e. on the server during deploy. Local builds without a
// DATABASE_URL skip it silently.
//
// A failed push (e.g. a destructive change Prisma refuses to apply without
// --accept-data-loss) logs a loud warning but does NOT fail the build —
// blocking every deploy is worse than a temporarily unsynced schema, and
// no data is ever lost either way. Fix the schema drift, never add
// --accept-data-loss here.
import { execSync } from 'node:child_process'

if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL found — syncing database schema (prisma db push)…')
  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' })
  } catch {
    console.warn('')
    console.warn('⚠️  ════════════════════════════════════════════════════════════')
    console.warn('⚠️  prisma db push FAILED — the database schema was NOT updated.')
    console.warn('⚠️  The build continues, but features needing new tables/columns')
    console.warn('⚠️  may return errors until the schema drift is resolved.')
    console.warn('⚠️  See the Prisma output above for the exact reason.')
    console.warn('⚠️  ════════════════════════════════════════════════════════════')
    console.warn('')
  }
} else {
  console.log('No DATABASE_URL — skipping prisma db push.')
}
