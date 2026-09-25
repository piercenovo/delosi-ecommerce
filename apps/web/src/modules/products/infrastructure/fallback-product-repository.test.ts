// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import {
  failingProductRepository,
  inMemoryProductRepository,
} from '@/test/in-memory-product-repository'
import { makeProduct } from '@/test/product-fixtures'
import { CatalogUnavailableError } from '../domain/errors'
import type { Category } from '../domain/product'
import { FallbackProductRepository } from './fallback-product-repository'

const category: Category = { slug: 'electronics', name: 'Electrónica' }
const unavailable = new CatalogUnavailableError('FakeStore request failed')
const liveProduct = makeProduct({ id: 1, title: 'Live product' })
const snapshotProduct = makeProduct({ id: 1, title: 'Snapshot product' })

const live = inMemoryProductRepository({ products: [liveProduct], categories: [category] })
const snapshot = inMemoryProductRepository({ products: [snapshotProduct], categories: [category] })

describe('FallbackProductRepository', () => {
  it('uses the primary source when it responds', async () => {
    const onFallback = vi.fn()
    const repository = new FallbackProductRepository(live, snapshot, onFallback)

    await expect(repository.findAll()).resolves.toEqual([liveProduct])
    expect(onFallback).not.toHaveBeenCalled()
  })

  it('falls back and reports the failure when the primary source fails', async () => {
    const onFallback = vi.fn()
    const repository = new FallbackProductRepository(
      failingProductRepository(unavailable),
      snapshot,
      onFallback,
    )

    await expect(repository.findAll()).resolves.toEqual([snapshotProduct])
    await expect(repository.findById(1)).resolves.toEqual(snapshotProduct)
    await expect(repository.findCategories()).resolves.toEqual([category])
    expect(onFallback).toHaveBeenCalledTimes(3)
    expect(onFallback).toHaveBeenCalledWith(unavailable, 'findAll')
  })

  it('keeps "not found" from the primary source instead of falling back', async () => {
    const repository = new FallbackProductRepository(inMemoryProductRepository({}), snapshot)

    await expect(repository.findById(1)).resolves.toBeNull()
  })

  it('propagates the error when both sources fail', async () => {
    const failing = failingProductRepository(unavailable)
    const repository = new FallbackProductRepository(failing, failing)

    await expect(repository.findAll()).rejects.toBe(unavailable)
  })
})
