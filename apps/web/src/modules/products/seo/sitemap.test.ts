import { describe, expect, it } from 'vitest'
import { categories, makeProduct } from '@/test/product-fixtures'
import { buildSitemap } from './sitemap'

const SITE = 'https://delosi-shop.vercel.app'

describe('buildSitemap', () => {
  const entries = buildSitemap(SITE, [makeProduct({ id: 1 }), makeProduct({ id: 2 })], categories)
  const urls = entries.map(({ url }) => url)

  it('lists the catalog, one URL per category and one per product, all absolute', () => {
    expect(urls).toEqual([
      `${SITE}/products`,
      `${SITE}/products?category=electronics`,
      `${SITE}/products?category=jewelery`,
      `${SITE}/products?category=mens-clothing`,
      `${SITE}/products?category=womens-clothing`,
      `${SITE}/products/1`,
      `${SITE}/products/2`,
    ])
  })

  it('uses the same URLs as the canonical tags (no search or sort variants)', () => {
    expect(urls.some((url) => url.includes('q=') || url.includes('sort='))).toBe(false)
  })

  it('does not invent modification dates the source does not have', () => {
    expect(entries.every((entry) => entry.lastModified === undefined)).toBe(true)
  })
})
