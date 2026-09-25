// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { CatalogUnavailableError } from '../domain/errors'
import type { Category, Product } from '../domain/product'
import type { ProductRepository } from '../domain/product-repository'
import { FallbackProductRepository } from './fallback-product-repository'

function makeProduct(id: number, title: string): Product {
  return {
    id,
    title,
    price: 10,
    description: '',
    categorySlug: 'electronics',
    image: `/images/products/${id}.png`,
    rating: { rate: 4, count: 1 },
  }
}

const category: Category = { slug: 'electronics', name: 'Electrónica' }

function inMemoryRepository(products: Product[]): ProductRepository {
  return {
    findAll: async () => products,
    findById: async (id) => products.find((product) => product.id === id) ?? null,
    findCategories: async () => [category],
  }
}

const unavailable = new CatalogUnavailableError('FakeStore request failed')
const failingRepository: ProductRepository = {
  findAll: () => Promise.reject(unavailable),
  findById: () => Promise.reject(unavailable),
  findCategories: () => Promise.reject(unavailable),
}

const liveProduct = makeProduct(1, 'Live product')
const snapshotProduct = makeProduct(1, 'Snapshot product')

describe('FallbackProductRepository', () => {
  it('uses the primary source when it responds', async () => {
    const onFallback = vi.fn()
    const repository = new FallbackProductRepository(
      inMemoryRepository([liveProduct]),
      inMemoryRepository([snapshotProduct]),
      onFallback,
    )

    await expect(repository.findAll()).resolves.toEqual([liveProduct])
    expect(onFallback).not.toHaveBeenCalled()
  })

  it('falls back and reports the failure when the primary source fails', async () => {
    const onFallback = vi.fn()
    const repository = new FallbackProductRepository(
      failingRepository,
      inMemoryRepository([snapshotProduct]),
      onFallback,
    )

    await expect(repository.findAll()).resolves.toEqual([snapshotProduct])
    await expect(repository.findById(1)).resolves.toEqual(snapshotProduct)
    await expect(repository.findCategories()).resolves.toEqual([category])
    expect(onFallback).toHaveBeenCalledTimes(3)
    expect(onFallback).toHaveBeenCalledWith(unavailable, 'findAll')
  })

  it('keeps "not found" from the primary source instead of falling back', async () => {
    const repository = new FallbackProductRepository(
      inMemoryRepository([]),
      inMemoryRepository([snapshotProduct]),
    )

    await expect(repository.findById(1)).resolves.toBeNull()
  })

  it('propagates the error when both sources fail', async () => {
    const repository = new FallbackProductRepository(failingRepository, failingRepository)

    await expect(repository.findAll()).rejects.toBe(unavailable)
  })
})
