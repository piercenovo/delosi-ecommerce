// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { makeProduct } from '@/test/product-fixtures'
import { SORT_KEYS } from './catalog-query'
import { SORT_STRATEGIES, sortProducts } from './sort-strategies'

const backpack = makeProduct({
  id: 1,
  title: 'Backpack',
  price: 109.95,
  rating: { rate: 3.9, count: 120 },
})
const tShirt = makeProduct({
  id: 2,
  title: 'T-Shirt',
  price: 22.3,
  rating: { rate: 4.1, count: 259 },
})
const jacket = makeProduct({
  id: 3,
  title: 'Ábaco jacket',
  price: 55.99,
  rating: { rate: 4.7, count: 500 },
})
const bracelet = makeProduct({
  id: 4,
  title: 'bracelet',
  price: 22.3,
  rating: { rate: 4.1, count: 100 },
})
const products = [backpack, tShirt, jacket, bracelet]

const ids = (list: { id: number }[]) => list.map((product) => product.id)

describe('SORT_STRATEGIES', () => {
  it('provides a strategy for every sort key', () => {
    expect(Object.keys(SORT_STRATEGIES).sort()).toEqual([...SORT_KEYS].sort())
  })
})

describe('sortProducts', () => {
  it('keeps the original order when no sort is given', () => {
    expect(ids(sortProducts(products))).toEqual([1, 2, 3, 4])
  })

  it('sorts by ascending price, breaking ties by id', () => {
    expect(ids(sortProducts(products, 'price-asc'))).toEqual([2, 4, 3, 1])
  })

  it('sorts by descending price, breaking ties by id', () => {
    expect(ids(sortProducts(products, 'price-desc'))).toEqual([1, 3, 2, 4])
  })

  it('sorts by rating, then by number of reviews', () => {
    expect(ids(sortProducts(products, 'rating'))).toEqual([3, 2, 4, 1])
  })

  it('sorts by name in Spanish, ignoring case and accents', () => {
    expect(ids(sortProducts(products, 'name'))).toEqual([3, 1, 4, 2])
  })

  it('returns a new array without mutating the input', () => {
    const snapshot = [...products]
    const result = sortProducts(products, 'price-asc')

    expect(result).not.toBe(products)
    expect(products).toEqual(snapshot)
  })
})
