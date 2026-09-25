// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { toCategory, toCategorySlug, toProduct } from './fakestore-mapper'
import type { ProductDto } from './fakestore-schemas'

const backpackDto: ProductDto = {
  id: 1,
  title: '  Fjallraven - Foldsack No. 1 Backpack  ',
  price: 109.95,
  description: 'Your perfect pack for everyday use. ',
  category: "men's clothing",
  image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png',
  rating: { rate: 3.9, count: 120 },
}

describe('toProduct', () => {
  it('maps a FakeStore product to the domain model', () => {
    expect(toProduct(backpackDto, {})).toEqual({
      id: 1,
      title: 'Fjallraven - Foldsack No. 1 Backpack',
      price: 109.95,
      description: 'Your perfect pack for everyday use.',
      categorySlug: 'mens-clothing',
      image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png',
      rating: { rate: 3.9, count: 120 },
    })
  })

  it('prefers the locally served image when one exists', () => {
    const product = toProduct(backpackDto, { '1': '/images/products/1.png' })

    expect(product.image).toBe('/images/products/1.png')
  })
})

describe('toCategorySlug', () => {
  it.each([
    ['electronics', 'electronics'],
    ["men's clothing", 'mens-clothing'],
    ["Women's  Clothing", 'womens-clothing'],
    ['Décor & Home', 'decor-home'],
  ])('turns %j into %j', (name, slug) => {
    expect(toCategorySlug(name)).toBe(slug)
  })
})

describe('toCategory', () => {
  it('uses the Spanish name for known categories', () => {
    expect(toCategory('jewelery')).toEqual({ slug: 'jewelery', name: 'Joyería' })
    expect(toCategory("women's clothing")).toEqual({
      slug: 'womens-clothing',
      name: 'Ropa de mujer',
    })
  })

  it('falls back to a capitalized name for unknown categories', () => {
    expect(toCategory('garden tools')).toEqual({ slug: 'garden-tools', name: 'Garden tools' })
  })
})
