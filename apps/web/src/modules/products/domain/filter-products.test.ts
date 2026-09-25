// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { makeProduct } from '@/test/product-fixtures'
import { filterByCategory, searchProducts } from './filter-products'

const jacket = makeProduct({
  id: 3,
  title: 'Mens Cotton Jacket',
  description: 'Great outerwear jackets for Spring/Autumn/Winter.',
  categorySlug: 'mens-clothing',
})
const ring = makeProduct({
  id: 5,
  title: 'Solid Gold Petite Micropave',
  description: 'Satisfaction guaranteed. Designed and sold by Hafeez Center.',
  categorySlug: 'jewelery',
})
const drive = makeProduct({
  id: 9,
  title: 'WD 2TB Elements Portable External Hard Drive',
  description: 'USB 3.0 and USB 2.0 compatibility. Fast data transfers.',
  categorySlug: 'electronics',
})
const products = [jacket, ring, drive]

describe('filterByCategory', () => {
  it('keeps every product when no category is given', () => {
    expect(filterByCategory(products)).toEqual(products)
  })

  it('keeps only the products of the given category', () => {
    expect(filterByCategory(products, 'jewelery')).toEqual([ring])
  })

  it('returns an empty list for a category without products', () => {
    expect(filterByCategory(products, 'womens-clothing')).toEqual([])
  })

  it('does not mutate the input', () => {
    const result = filterByCategory(products)

    expect(result).not.toBe(products)
  })
})

describe('searchProducts', () => {
  it.each([undefined, '', '   '])('keeps every product for the empty search %j', (text) => {
    expect(searchProducts(products, text)).toEqual(products)
  })

  it('matches the title ignoring case', () => {
    expect(searchProducts(products, 'JACKET')).toEqual([jacket])
  })

  it('matches the description', () => {
    expect(searchProducts(products, 'usb')).toEqual([drive])
  })

  it('ignores accents in both the search and the product', () => {
    const cafe = makeProduct({ id: 20, title: 'Café Mug' })

    expect(searchProducts([cafe, drive], 'cafe')).toEqual([cafe])
    expect(searchProducts([jacket], 'jácket')).toEqual([jacket])
  })

  it('requires every term to appear in the title or description', () => {
    expect(searchProducts(products, 'mens cotton')).toEqual([jacket])
    expect(searchProducts(products, 'cotton gold')).toEqual([])
  })

  it('matches terms at the start of a word, not inside it', () => {
    const womensShirt = makeProduct({
      id: 18,
      title: 'Womens T Shirt Casual Cotton Short',
      categorySlug: 'womens-clothing',
    })

    expect(searchProducts([jacket, womensShirt], 'mens')).toEqual([jacket])
    expect(searchProducts([jacket, womensShirt], 'cott')).toEqual([jacket, womensShirt])
  })

  it('treats punctuation as a word separator', () => {
    expect(searchProducts(products, 'autumn')).toEqual([jacket])
  })

  it('returns an empty list when nothing matches', () => {
    expect(searchProducts(products, 'laptop')).toEqual([])
  })
})
