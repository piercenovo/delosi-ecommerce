import { describe, expect, it } from 'vitest'
import type { CartState } from './cart'
import { selectItemQuantity, selectSubtotal, selectTotalItems } from './cart-selectors'

const line = (productId: number, price: number, quantity: number) => ({
  productId,
  title: `Product ${productId}`,
  price,
  image: `/images/products/${productId}.png`,
  quantity,
})

const state: CartState = { items: [line(1, 0.1, 1), line(2, 0.2, 1), line(3, 9.99, 3)] }

describe('cart selectors', () => {
  it('counts every unit in the cart', () => {
    expect(selectTotalItems(state)).toBe(5)
    expect(selectTotalItems({ items: [] })).toBe(0)
  })

  it('adds up the subtotal without floating point drift', () => {
    // 0.1 + 0.2 + 29.97 would be 30.270000000000003 in plain floating point.
    expect(selectSubtotal(state)).toBe(30.27)
    expect(selectSubtotal({ items: [] })).toBe(0)
  })

  it('returns the quantity of one product, 0 when it is not in the cart', () => {
    expect(selectItemQuantity(3)(state)).toBe(3)
    expect(selectItemQuantity(99)(state)).toBe(0)
  })
})
