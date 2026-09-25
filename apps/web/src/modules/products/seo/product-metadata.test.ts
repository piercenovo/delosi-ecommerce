import { describe, expect, it } from 'vitest'
import { makeProduct } from '@/test/product-fixtures'
import { buildProductMetadata, META_DESCRIPTION_MAX } from './product-metadata'

const product = makeProduct({
  id: 5,
  title: 'John Hardy Women Legends Naga Bracelet',
  description: 'From our Legends Collection, the Naga was inspired by the mythical water dragon.',
  image: '/images/products/5.png',
})

describe('buildProductMetadata', () => {
  it('uses the product title and description', () => {
    const metadata = buildProductMetadata(product)

    expect(metadata.title).toBe('John Hardy Women Legends Naga Bracelet')
    expect(metadata.description).toBe(product.description)
  })

  it('points the canonical URL to the product path', () => {
    expect(buildProductMetadata(product).alternates?.canonical).toBe('/products/5')
  })

  it('shares the product image on Open Graph and Twitter', () => {
    const metadata = buildProductMetadata(product)

    expect(metadata.openGraph).toMatchObject({
      type: 'website',
      url: '/products/5',
      title: product.title,
      images: [{ url: '/images/products/5.png', alt: product.title }],
    })
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      images: ['/images/products/5.png'],
    })
  })

  it('cuts long descriptions at a word boundary, with an ellipsis', () => {
    const long = makeProduct({ id: 1, description: `${'palabra '.repeat(40)}final` })
    const description = buildProductMetadata(long).description ?? ''

    expect(description.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX)
    expect(description.endsWith('palabra…')).toBe(true)
  })

  it('collapses whitespace from the source text', () => {
    const messy = makeProduct({ id: 2, description: '  Line one.\n\n  Line   two. ' })

    expect(buildProductMetadata(messy).description).toBe('Line one. Line two.')
  })
})
