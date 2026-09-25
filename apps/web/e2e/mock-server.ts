/**
 * FakeStore stand-in for the E2E suite: deterministic data (the versioned snapshot) and no
 * network. Run with Node's native TypeScript support:
 *   MOCK_PORT=4010 node e2e/mock-server.ts            healthy API
 *   MOCK_PORT=4011 MOCK_MODE=down node e2e/mock-server.ts   every request answers 500
 */
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'

interface Snapshot {
  products: { id: number }[]
  categories: string[]
}

const snapshotUrl = new URL(
  '../src/modules/products/infrastructure/snapshot/fakestore-snapshot.json',
  import.meta.url,
)
const snapshot = JSON.parse(readFileSync(snapshotUrl, 'utf8')) as Snapshot
const port = Number(process.env.MOCK_PORT ?? 4010)
const down = process.env.MOCK_MODE === 'down'

function json(body: unknown) {
  return { status: 200, body: JSON.stringify(body) }
}

function route(pathname: string): { status: number; body: string } {
  // Readiness probe for Playwright's webServer: healthy in both modes.
  if (pathname === '/__health') return json({ mode: down ? 'down' : 'healthy' })
  if (down) return { status: 500, body: JSON.stringify({ error: 'mock: API down' }) }
  if (pathname === '/products') return json(snapshot.products)
  if (pathname === '/products/categories') return json(snapshot.categories)

  const match = /^\/products\/(\d+)$/.exec(pathname)
  if (match) {
    const product = snapshot.products.find(({ id }) => id === Number(match[1]))
    // Like FakeStore: an unknown id answers 200 with an empty body.
    return product ? json(product) : { status: 200, body: '' }
  }
  return { status: 404, body: '' }
}

createServer((request, response) => {
  const { status, body } = route(new URL(request.url ?? '/', 'http://mock').pathname)
  response.writeHead(status, { 'content-type': 'application/json' })
  response.end(body)
}).listen(port, () => {
  console.info(`FakeStore mock (${down ? 'down' : 'healthy'}) on http://localhost:${port}`)
})
