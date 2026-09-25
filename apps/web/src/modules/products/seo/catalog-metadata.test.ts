import { describe, expect, it } from 'vitest'
import { categories } from '@/test/product-fixtures'
import { buildCatalogMetadata, SITE_OG_IMAGE } from './catalog-metadata'

describe('buildCatalogMetadata', () => {
  it('describes the whole catalog without filters', () => {
    const metadata = buildCatalogMetadata({}, categories)

    expect(metadata.title).toBe('Catálogo')
    expect(metadata.alternates?.canonical).toBe('/products')
    expect(metadata.robots).toBeUndefined()
  })

  it('titles a category page and keeps the category in the canonical URL', () => {
    const metadata = buildCatalogMetadata({ category: 'jewelery' }, categories)

    expect(metadata.title).toBe('Joyería')
    expect(metadata.description).toContain('Joyería')
    expect(metadata.alternates?.canonical).toBe('/products?category=jewelery')
    expect(metadata.openGraph).toMatchObject({
      title: 'Joyería',
      url: '/products?category=jewelery',
    })
  })

  it('drops sort from the canonical URL: every order is the same content', () => {
    const metadata = buildCatalogMetadata({ category: 'jewelery', sort: 'price-asc' }, categories)

    expect(metadata.alternates?.canonical).toBe('/products?category=jewelery')
    expect(metadata.robots).toBeUndefined()
  })

  it('keeps search results out of the index but lets crawlers follow the links', () => {
    const metadata = buildCatalogMetadata({ q: 'gold', category: 'jewelery' }, categories)

    expect(metadata.alternates?.canonical).toBe('/products?category=jewelery')
    expect(metadata.robots).toEqual({ index: false, follow: true })
  })

  it('ignores an unknown category', () => {
    const metadata = buildCatalogMetadata({ category: 'toys' }, categories)

    expect(metadata.title).toBe('Catálogo')
    expect(metadata.alternates?.canonical).toBe('/products')
  })

  it('shares the brand card on Open Graph and Twitter', () => {
    const metadata = buildCatalogMetadata({}, categories)

    expect(metadata.openGraph).toMatchObject({ images: [SITE_OG_IMAGE] })
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      images: ['/opengraph-image'],
    })
  })
})
