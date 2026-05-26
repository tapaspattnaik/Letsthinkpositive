/**
 * Custom server for Hostinger Node.js app manager.
 * Hostinger requires an explicit entry point — this wraps next start.
 */
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev  = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT || '3000', 10)
const app  = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling', req.url, err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  }).listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
