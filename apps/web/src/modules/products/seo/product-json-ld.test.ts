import { describe, expect, it } from 'vitest'
import { makeProduct } from '@/test/product-fixtures'
import { buildBreadcrumbJsonLd, buildProductJsonLd } from './product-json-ld'

const SITE = 'https://delosi-shop.vercel.app'
const product = makeProduct({
  id: 5,
  title: 'Naga Bracelet',
  description: 'Inspired by the water dragon.',
  price: 695,
  image: '/images/products/5.png',
  rating: { rate: 4.6, count: 400 },
})
const category = { slug: 'jewelery', name: 'Joyería' }

describe('buildProductJsonLd', () => {
  it('describes the product with absolute URLs', () => {
    expect(buildProductJsonLd(product, category, SITE)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Product',
      sku: '5',
      name: 'Naga Bracelet',
      description: 'Inspired by the water dragon.',
      image: `${SITE}/images/products/5.png`,
      url: `${SITE}/products/5`,
      category: 'Joyería',
      offers: {
        '@type': 'Offer',
        price: '695.00',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `${SITE}/products/5`,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: 4.6,
        reviewCount: 400,
        bestRating: 5,
      },
    })
  })

  it('omits the rating without reviews and the category when unknown', () => {
    const unrated = makeProduct({ id: 7, rating: { rate: 0, count: 0 } })
    const jsonLd = buildProductJsonLd(unrated, null, SITE)

    expect(jsonLd).not.toHaveProperty('aggregateRating')
    expect(jsonLd).not.toHaveProperty('category')
  })
})

describe('buildBreadcrumbJsonLd', () => {
  it('lists the trail in order, with absolute URLs except for the current page', () => {
    const jsonLd = buildBreadcrumbJsonLd(
      [
        { label: 'Catálogo', href: '/products' },
        { label: 'Joyería', href: '/products?category=jewelery' },
        { label: 'Naga Bracelet' },
      ],
      SITE,
    )

    expect(jsonLd).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Catálogo', item: `${SITE}/products` },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Joyería',
          item: `${SITE}/products?category=jewelery`,
        },
        { '@type': 'ListItem', position: 3, name: 'Naga Bracelet' },
      ],
    })
  })
})
