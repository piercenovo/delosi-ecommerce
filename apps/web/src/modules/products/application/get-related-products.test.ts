// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { inMemoryProductRepository } from '@/test/in-memory-product-repository'
import { makeProduct } from '@/test/product-fixtures'
import { getRelatedProducts } from './get-related-products'

const rating = (rate: number) => ({ rate, count: 10 })
const current = makeProduct({ id: 1, categorySlug: 'jewelery', rating: rating(5) })
const products = [
  current,
  makeProduct({ id: 2, categorySlug: 'jewelery', rating: rating(3) }),
  makeProduct({ id: 3, categorySlug: 'jewelery', rating: rating(4.5) }),
  makeProduct({ id: 4, categorySlug: 'electronics', rating: rating(5) }),
  makeProduct({ id: 5, categorySlug: 'jewelery', rating: rating(4) }),
  makeProduct({ id: 6, categorySlug: 'jewelery', rating: rating(2) }),
  makeProduct({ id: 7, categorySlug: 'jewelery', rating: rating(1) }),
]
const repository = inMemoryProductRepository({ products })

describe('getRelatedProducts', () => {
  it('returns up to four products of the same category, best rated first', async () => {
    const related = await getRelatedProducts(repository, current)

    expect(related.map((product) => product.id)).toEqual([3, 5, 2, 6])
  })

  it('never includes the product itself', async () => {
    const related = await getRelatedProducts(repository, current, 10)

    expect(related.map((product) => product.id)).not.toContain(1)
  })

  it('respects a custom limit', async () => {
    await expect(getRelatedProducts(repository, current, 2)).resolves.toHaveLength(2)
  })

  it('returns an empty list when the category has no other products', async () => {
    const lonely = makeProduct({ id: 4, categorySlug: 'electronics' })

    await expect(getRelatedProducts(repository, lonely)).resolves.toEqual([])
  })
})
