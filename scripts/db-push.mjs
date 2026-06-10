// Runs `prisma db push` before the build, but only when a database is
// configured — i.e. on the server during deploy. Local builds without a
// DATABASE_URL skip it silently. Destructive schema changes still fail the
// build (prisma refuses without --accept-data-loss), which blocks the deploy
// instead of losing data.
import { execSync } from 'node:child_process'

if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL found — syncing database schema (prisma db push)…')
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' })
} else {
  console.log('No DATABASE_URL — skipping prisma db push.')
}
