import type { Category, Product, ProductId } from '../domain/product'
import type { ProductRepository } from '../domain/product-repository'

export type FallbackListener = (error: unknown, operation: keyof ProductRepository) => void

/**
 * Decorator that reads from a primary repository and, when it fails, from a fallback one.
 * A `null` result ("not found") from the primary is a valid answer and is not retried.
 */
export class FallbackProductRepository implements ProductRepository {
  private readonly primary: ProductRepository
  private readonly fallback: ProductRepository
  private readonly onFallback: FallbackListener

  constructor(
    primary: ProductRepository,
    fallback: ProductRepository,
    onFallback: FallbackListener = () => {},
  ) {
    this.primary = primary
    this.fallback = fallback
    this.onFallback = onFallback
  }

  findAll(): Promise<Product[]> {
    return this.withFallback('findAll', (repository) => repository.findAll())
  }

  findById(id: ProductId): Promise<Product | null> {
    return this.withFallback('findById', (repository) => repository.findById(id))
  }

  findCategories(): Promise<Category[]> {
    return this.withFallback('findCategories', (repository) => repository.findCategories())
  }

  private async withFallback<T>(
    operation: keyof ProductRepository,
    read: (repository: ProductRepository) => Promise<T>,
  ): Promise<T> {
    try {
      return await read(this.primary)
    } catch (error) {
      this.onFallback(error, operation)
      return read(this.fallback)
    }
  }
}
