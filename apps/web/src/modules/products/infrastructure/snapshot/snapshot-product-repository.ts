import type { Category, Product, ProductId } from '../../domain/product'
import type { ProductRepository } from '../../domain/product-repository'
import { toCategory, toProduct } from '../fakestore/fakestore-mapper'
import { fakeStoreSnapshotSchema, type FakeStoreSnapshot } from '../fakestore/fakestore-schemas'

/**
 * Adapter over a versioned FakeStore snapshot (see `scripts/snapshot-fakestore.ts`).
 * Used as a fallback when the live API is unreachable, e.g. when Cloudflare blocks
 * datacenter IPs in CI and on Vercel.
 */
export class SnapshotProductRepository implements ProductRepository {
  private readonly products: readonly Product[]
  private readonly categories: readonly Category[]

  constructor(snapshot: FakeStoreSnapshot) {
    this.products = snapshot.products.map((dto) => toProduct(dto, snapshot.images))
    this.categories = snapshot.categories.map(toCategory)
  }

  static fromJson(raw: unknown): SnapshotProductRepository {
    return new SnapshotProductRepository(fakeStoreSnapshotSchema.parse(raw))
  }

  async findAll(): Promise<Product[]> {
    return [...this.products]
  }

  async findById(id: ProductId): Promise<Product | null> {
    return this.products.find((product) => product.id === id) ?? null
  }

  async findCategories(): Promise<Category[]> {
    return [...this.categories]
  }
}
