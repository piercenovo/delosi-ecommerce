import type { Category, Product, ProductId } from './product'

/**
 * Port for reading the product catalog. Implementations live in `infrastructure/`.
 * `findById` resolves to `null` when the product does not exist and rejects with
 * `CatalogUnavailableError` when the data source cannot be read.
 */
export interface ProductRepository {
  findAll(): Promise<Product[]>
  findById(id: ProductId): Promise<Product | null>
  findCategories(): Promise<Category[]>
}
