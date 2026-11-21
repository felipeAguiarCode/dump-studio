import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const site = resolve(fileURLToPath(new URL('../', import.meta.url)))
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8'
}

export function createSiteServer({ onMissing = () => {} } = {}) {
  return createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return
    }
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
      const target = resolve(site, '.' + (pathname === '/' ? '/index.html' : pathname))
      if (!target.startsWith(site + sep) || !(await stat(target)).isFile()) throw Error('Not a site file')
      const body = await readFile(target)
      res.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'Content-Length': body.length })
      res.end(req.method === 'HEAD' ? undefined : body)
    } catch {
      onMissing(req.url)
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Not found')
    }
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const portArgument = process.argv.indexOf('--port')
  const port = Number(portArgument === -1 ? 4173 : process.argv[portArgument + 1])
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('Invalid --port')
  const server = createSiteServer()
  server.on('error', error => {
    console.error(error.code === 'EADDRINUSE'
      ? `Port ${port} is busy. Use npm run site -- --port 4174.`
      : error.message)
    process.exitCode = 1
  })
  server.listen(port, '127.0.0.1', () => {
    console.log(`My Dump Studio: http://127.0.0.1:${port}/`)
    console.log(`Serving ${site} (cache disabled). Ctrl+C to stop.`)
  })
}
