import { cacheLife } from 'next/cache'
import { productRepository } from '@/composition-root'

async function getProducts() {
  'use cache'
  cacheLife('hours')

  return productRepository.findAll()
}

export default async function ProductsPage() {
  const products = await getProducts()

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
