import type { Category, Product } from '@/modules/products/domain/product'
import type { ProductRepository } from '@/modules/products/domain/product-repository'

export function inMemoryProductRepository({
  products = [],
  categories = [],
}: {
  products?: Product[]
  categories?: Category[]
}): ProductRepository {
  return {
    findAll: async () => [...products],
    findById: async (id) => products.find((product) => product.id === id) ?? null,
    findCategories: async () => [...categories],
  }
}

export function failingProductRepository(error: unknown): ProductRepository {
  return {
    findAll: () => Promise.reject(error),
    findById: () => Promise.reject(error),
    findCategories: () => Promise.reject(error),
  }
}
