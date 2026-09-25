import type { Product } from '../domain/product'
import type { ProductRepository } from '../domain/product-repository'
import { sortProducts } from '../domain/sort-strategies'

const DEFAULT_LIMIT = 4

/** Best-rated products of the same category, excluding the product itself. */
export async function getRelatedProducts(
  repository: ProductRepository,
  product: Product,
  limit: number = DEFAULT_LIMIT,
): Promise<Product[]> {
  const products = await repository.findAll()
  const sameCategory = products.filter(
    (candidate) => candidate.categorySlug === product.categorySlug && candidate.id !== product.id,
  )
  return sortProducts(sameCategory, 'rating').slice(0, limit)
}
