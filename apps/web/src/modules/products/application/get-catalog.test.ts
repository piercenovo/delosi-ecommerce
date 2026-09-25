// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  failingProductRepository,
  inMemoryProductRepository,
} from '@/test/in-memory-product-repository'
import { categories, makeProduct } from '@/test/product-fixtures'
import { CatalogUnavailableError } from '../domain/errors'
import { getCatalog } from './get-catalog'

const jacket = makeProduct({
  id: 1,
  title: 'Mens Cotton Jacket',
  price: 55.99,
  categorySlug: 'mens-clothing',
})
const shirt = makeProduct({
  id: 2,
  title: 'Mens Casual Shirt',
  price: 15.99,
  categorySlug: 'mens-clothing',
})
const ring = makeProduct({ id: 3, title: 'Gold Ring', price: 9.99, categorySlug: 'jewelery' })
const repository = inMemoryProductRepository({ products: [jacket, shirt, ring], categories })

describe('getCatalog', () => {
  it('returns every product and category when the query is empty', async () => {
    const catalog = await getCatalog(repository, {})

    expect(catalog.products).toEqual([jacket, shirt, ring])
    expect(catalog.categories).toEqual(categories)
    expect(catalog.activeCategory).toBeNull()
    expect(catalog.query).toEqual({})
  })

  it('filters by category, searches and sorts in a single query', async () => {
    const catalog = await getCatalog(repository, {
      category: 'mens-clothing',
      q: 'mens',
      sort: 'price-asc',
    })

    expect(catalog.products).toEqual([shirt, jacket])
    expect(catalog.activeCategory).toEqual({ slug: 'mens-clothing', name: 'Ropa de hombre' })
    expect(catalog.query).toEqual({ category: 'mens-clothing', q: 'mens', sort: 'price-asc' })
  })

  it('ignores a category that does not exist', async () => {
    const catalog = await getCatalog(repository, { category: 'garden', sort: 'price-asc' })

    expect(catalog.products).toEqual([ring, shirt, jacket])
    expect(catalog.activeCategory).toBeNull()
    expect(catalog.query).toEqual({ sort: 'price-asc' })
  })

  it('returns an empty list when nothing matches', async () => {
    const catalog = await getCatalog(repository, { q: 'laptop' })

    expect(catalog.products).toEqual([])
  })

  it('propagates CatalogUnavailableError', async () => {
    const error = new CatalogUnavailableError('down')

    await expect(getCatalog(failingProductRepository(error), {})).rejects.toBe(error)
  })
})
