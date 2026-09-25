// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { buildCatalogHref, parseCatalogQuery } from './catalog-search-params'

describe('parseCatalogQuery', () => {
  it('reads a complete query', () => {
    expect(parseCatalogQuery({ category: 'jewelery', q: 'gold ring', sort: 'price-asc' })).toEqual({
      category: 'jewelery',
      q: 'gold ring',
      sort: 'price-asc',
    })
  })

  it('returns an empty query when there are no params', () => {
    expect(parseCatalogQuery({})).toEqual({})
  })

  it('drops each invalid field on its own instead of failing', () => {
    expect(parseCatalogQuery({ category: '../etc', q: 'ring', sort: 'cheapest' })).toEqual({
      q: 'ring',
    })
  })

  it('normalizes the category slug', () => {
    expect(parseCatalogQuery({ category: '  Mens-Clothing ' })).toEqual({
      category: 'mens-clothing',
    })
  })

  it('trims the search and drops it when empty', () => {
    expect(parseCatalogQuery({ q: '  gold  ' })).toEqual({ q: 'gold' })
    expect(parseCatalogQuery({ q: '   ' })).toEqual({})
  })

  it('truncates the search to 100 characters', () => {
    const q = parseCatalogQuery({ q: 'a'.repeat(150) }).q

    expect(q).toHaveLength(100)
  })

  it('takes the first value when a param is repeated', () => {
    expect(parseCatalogQuery({ sort: ['rating', 'name'] })).toEqual({ sort: 'rating' })
  })
})

describe('buildCatalogHref', () => {
  it('points to the bare catalog when the query is empty', () => {
    expect(buildCatalogHref({})).toBe('/products')
  })

  it('serializes the params in a stable order', () => {
    expect(buildCatalogHref({ sort: 'rating', q: 'gold ring', category: 'jewelery' })).toBe(
      '/products?category=jewelery&q=gold+ring&sort=rating',
    )
  })

  it('applies overrides while keeping the rest of the query', () => {
    expect(
      buildCatalogHref({ category: 'jewelery', sort: 'rating' }, { category: 'electronics' }),
    ).toBe('/products?category=electronics&sort=rating')
  })

  it('removes a param when its override is undefined', () => {
    expect(buildCatalogHref({ category: 'jewelery', q: 'gold' }, { category: undefined })).toBe(
      '/products?q=gold',
    )
  })

  it('omits empty values and encodes special characters', () => {
    expect(buildCatalogHref({ q: 'men’s & women', category: '' })).toBe(
      '/products?q=men%E2%80%99s+%26+women',
    )
  })

  it('round-trips through parseCatalogQuery', () => {
    const query = { category: 'mens-clothing', q: 'cotton jacket', sort: 'name' as const }
    const params = Object.fromEntries(
      new URL(buildCatalogHref(query), 'https://x.test').searchParams,
    )

    expect(parseCatalogQuery(params)).toEqual(query)
  })
})
