// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { inMemoryProductRepository } from '@/test/in-memory-product-repository'
import { makeProduct } from '@/test/product-fixtures'
import { ProductNotFoundError } from '../domain/errors'
import { getProductDetail } from './get-product-detail'

const backpack = makeProduct({ id: 1, title: 'Backpack' })
const repository = inMemoryProductRepository({ products: [backpack] })

describe('getProductDetail', () => {
  it('returns the product', async () => {
    await expect(getProductDetail(repository, 1)).resolves.toEqual(backpack)
  })

  it('rejects with ProductNotFoundError when the product does not exist', async () => {
    await expect(getProductDetail(repository, 999)).rejects.toEqual(new ProductNotFoundError(999))
  })
})
