import type { z } from 'zod'
import { CatalogUnavailableError } from '../domain/errors'
import type { Category, Product, ProductId } from '../domain/product'
import type { ProductRepository } from '../domain/product-repository'
import type { FakeStoreClient } from './fakestore-client'
import { toCategory, toProduct } from './fakestore-mapper'
import {
  categoryListDtoSchema,
  productDtoSchema,
  productListDtoSchema,
  type LocalImages,
} from './fakestore-schemas'

/** Adapter for the live FakeStore API. */
export class FakeStoreProductRepository implements ProductRepository {
  private readonly client: FakeStoreClient
  private readonly localImages: LocalImages

  constructor(client: FakeStoreClient, localImages: LocalImages) {
    this.client = client
    this.localImages = localImages
  }

  async findAll(): Promise<Product[]> {
    const dtos = await this.readRequired('/products', productListDtoSchema)
    return dtos.map((dto) => toProduct(dto, this.localImages))
  }

  async findById(id: ProductId): Promise<Product | null> {
    const dto = await this.read(`/products/${id}`, productDtoSchema)
    return dto === null ? null : toProduct(dto, this.localImages)
  }

  async findCategories(): Promise<Category[]> {
    const names = await this.readRequired('/products/categories', categoryListDtoSchema)
    return names.map(toCategory)
  }

  private async readRequired<T>(path: string, schema: z.ZodType<T>): Promise<T> {
    const data = await this.read(path, schema)
    if (data === null) {
      throw new CatalogUnavailableError(`FakeStore returned an empty body for ${path}`)
    }
    return data
  }

  private async read<T>(path: string, schema: z.ZodType<T>): Promise<T | null> {
    let body: unknown
    try {
      body = await this.client.getJson(path)
    } catch (error) {
      throw new CatalogUnavailableError(`FakeStore request failed for ${path}`, { cause: error })
    }
    if (body === null) return null

    const result = schema.safeParse(body)
    if (!result.success) {
      throw new CatalogUnavailableError(`FakeStore returned an unexpected payload for ${path}`, {
        cause: result.error,
      })
    }
    return result.data
  }
}
