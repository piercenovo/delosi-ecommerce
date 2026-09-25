import { describe, expect, it } from 'vitest'
import { makeProduct } from '@/test/product-fixtures'
import { buildProductBreadcrumbs } from './product-breadcrumbs'

const product = makeProduct({ id: 5, title: 'Naga Bracelet', categorySlug: 'jewelery' })

describe('buildProductBreadcrumbs', () => {
  it('goes catalog → category → product, with links on all but the current page', () => {
    expect(buildProductBreadcrumbs(product, { slug: 'jewelery', name: 'Joyería' })).toEqual([
      { label: 'Catálogo', href: '/products' },
      { label: 'Joyería', href: '/products?category=jewelery' },
      { label: 'Naga Bracelet' },
    ])
  })

  it('skips the category when it is unknown', () => {
    expect(buildProductBreadcrumbs(product, null)).toEqual([
      { label: 'Catálogo', href: '/products' },
      { label: 'Naga Bracelet' },
    ])
  })
})
