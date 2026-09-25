import type { ProductId } from './product'

export class CatalogUnavailableError extends Error {
  override readonly name = 'CatalogUnavailableError'

  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
  }
}

export class ProductNotFoundError extends Error {
  override readonly name = 'ProductNotFoundError'
  readonly productId: ProductId

  constructor(productId: ProductId) {
    super(`Product ${productId} does not exist`)
    this.productId = productId
  }
}
