import { cacheLife } from 'next/cache'
import { z } from 'zod'
import { serverEnv } from '@/shared/config/server-env'

const productSummariesSchema = z.array(z.object({ id: z.number(), title: z.string() }))

async function getProductSummaries() {
  'use cache'
  cacheLife('hours')

  const response = await fetch(`${serverEnv.PRODUCTS_API_BASE_URL}/products`)
  if (!response.ok) {
    throw new Error(`FakeStore responded with status ${response.status}`)
  }

  return productSummariesSchema.parse(await response.json())
}

export default async function ProductsPage() {
  const products = await getProductSummaries()

  return (
    <main>
      <h1>Catálogo</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.title}</li>
        ))}
      </ul>
    </main>
  )
}
