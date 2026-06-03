/**
 * Custom server for Hostinger Node.js app manager.
 * Hostinger requires an explicit entry point — this wraps next start.
 */
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// Default to production — only use dev mode if explicitly set to 'development'
// Using !== 'production' means an unset NODE_ENV would trigger dev mode (wrong)
const dev  = process.env.NODE_ENV === 'development'
const port = parseInt(process.env.PORT || '3000', 10)

// Limit concurrent connections to prevent process count explosion on shared hosting
const MAX_CONNECTIONS = 50

const app    = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling', req.url, err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })

  server.maxConnections = MAX_CONNECTIONS

  // Graceful shutdown — closes DB connections cleanly when process exits
  const shutdown = () => {
    console.log('> Graceful shutdown...')
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(1), 10000)
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT',  shutdown)

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port} [${dev ? 'dev' : 'production'}]`)
  })
})
