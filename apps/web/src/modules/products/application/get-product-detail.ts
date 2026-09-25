import { ProductNotFoundError } from '../domain/errors'
import type { Product, ProductId } from '../domain/product'
import type { ProductRepository } from '../domain/product-repository'

export async function getProductDetail(
  repository: ProductRepository,
  id: ProductId,
): Promise<Product> {
  const product = await repository.findById(id)
  if (!product) throw new ProductNotFoundError(id)
  return product
}
