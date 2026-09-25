/**
 * Captures a versioned snapshot of the FakeStore catalog (products, categories and images).
 *
 * FakeStore sits behind a Cloudflare challenge that blocks datacenter IPs (CI, Vercel),
 * so the snapshot must be captured from a residential connection:
 *
 *   pnpm --filter @delosi/web snapshot
 *
 * The raw API payload is stored as-is; the app validates and maps it with the same
 * Zod schemas and mapper it uses for live responses.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const API_BASE_URL = process.env.PRODUCTS_API_BASE_URL ?? 'https://fakestoreapi.com'
const APP_ROOT = path.resolve(import.meta.dirname, '..')
const SNAPSHOT_FILE = path.join(
  APP_ROOT,
  'src/modules/products/infrastructure/snapshot/fakestore-snapshot.json',
)
const IMAGES_DIR = path.join(APP_ROOT, 'public/images/products')
const PUBLIC_IMAGES_PATH = '/images/products'

interface RawProduct {
  id: number
  image: string
}

async function fetchOk(url: string): Promise<Response> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`GET ${url} responded with status ${response.status}`)
  }
  return response
}

const products = (await (await fetchOk(`${API_BASE_URL}/products`)).json()) as RawProduct[]
const categories: unknown = await (await fetchOk(`${API_BASE_URL}/products/categories`)).json()

await mkdir(IMAGES_DIR, { recursive: true })
await mkdir(path.dirname(SNAPSHOT_FILE), { recursive: true })

const images: Record<string, string> = {}
for (const product of products) {
  const fileName = `${product.id}${path.extname(new URL(product.image).pathname)}`
  const image = await fetchOk(product.image)
  await writeFile(path.join(IMAGES_DIR, fileName), Buffer.from(await image.arrayBuffer()))
  images[String(product.id)] = `${PUBLIC_IMAGES_PATH}/${fileName}`
}

const snapshot = {
  source: API_BASE_URL,
  capturedAt: new Date().toISOString(),
  products,
  categories,
  images,
}
await writeFile(SNAPSHOT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`)

console.info(
  `Snapshot saved: ${products.length} products, ${Object.keys(images).length} images -> ${path.relative(APP_ROOT, SNAPSHOT_FILE)}`,
)
