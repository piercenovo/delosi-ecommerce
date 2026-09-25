import { describe, expect, it } from 'vitest'
import { EMPTY_CART, MAX_QUANTITY, type CartProduct, type CartState } from './cart'
import { cartReducer } from './cart-reducer'

const bracelet: CartProduct = {
  id: 5,
  title: 'Naga Bracelet',
  price: 695,
  image: '/images/products/5.png',
}
const ring: CartProduct = {
  id: 7,
  title: 'Princess Ring',
  price: 9.99,
  image: '/images/products/7.png',
}

function withItems(...entries: [CartProduct, number][]): CartState {
  return Object.freeze({
    items: entries.map(([product, quantity]) =>
      Object.freeze({
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity,
      }),
    ),
  }) as CartState
}

describe('cartReducer', () => {
  describe('add', () => {
    it('adds a new line with the product data and quantity 1 by default', () => {
      const state = cartReducer(EMPTY_CART, { type: 'add', product: bracelet })

      expect(state.items).toEqual([
        {
          productId: 5,
          title: 'Naga Bracelet',
          price: 695,
          image: '/images/products/5.png',
          quantity: 1,
        },
      ])
    })

    it('sums the quantity when the product is already in the cart', () => {
      const state = cartReducer(withItems([bracelet, 2]), {
        type: 'add',
        product: bracelet,
        quantity: 3,
      })

      expect(state.items).toHaveLength(1)
      expect(state.items[0]?.quantity).toBe(5)
    })

    it('keeps the order in which products were added', () => {
      const state = cartReducer(withItems([bracelet, 1]), { type: 'add', product: ring })

      expect(state.items.map(({ productId }) => productId)).toEqual([5, 7])
    })

    it(`never goes above ${MAX_QUANTITY} units per product`, () => {
      const state = cartReducer(withItems([bracelet, 98]), {
        type: 'add',
        product: bracelet,
        quantity: 5,
      })

      expect(state.items[0]?.quantity).toBe(MAX_QUANTITY)
    })

    it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
      'ignores an invalid quantity (%s)',
      (quantity) => {
        const initial = withItems([bracelet, 1])

        expect(cartReducer(initial, { type: 'add', product: ring, quantity })).toBe(initial)
      },
    )

    it('returns the same state when the line is already at the maximum', () => {
      const initial = withItems([bracelet, MAX_QUANTITY])

      expect(cartReducer(initial, { type: 'add', product: bracelet })).toBe(initial)
    })
  })

  describe('remove', () => {
    it('removes the line of that product', () => {
      const state = cartReducer(withItems([bracelet, 1], [ring, 2]), {
        type: 'remove',
        productId: 5,
      })

      expect(state.items.map(({ productId }) => productId)).toEqual([7])
    })

    it('returns the same state for a product that is not in the cart', () => {
      const initial = withItems([bracelet, 1])

      expect(cartReducer(initial, { type: 'remove', productId: 99 })).toBe(initial)
    })
  })

  describe('setQuantity', () => {
    it('sets the quantity of a line', () => {
      const state = cartReducer(withItems([bracelet, 1]), {
        type: 'setQuantity',
        productId: 5,
        quantity: 4,
      })

      expect(state.items[0]?.quantity).toBe(4)
    })

    it(`clamps to ${MAX_QUANTITY}`, () => {
      const state = cartReducer(withItems([bracelet, 1]), {
        type: 'setQuantity',
        productId: 5,
        quantity: 500,
      })

      expect(state.items[0]?.quantity).toBe(MAX_QUANTITY)
    })

    it.each([0, -3])('removes the line when the quantity is %s', (quantity) => {
      const state = cartReducer(withItems([bracelet, 2]), {
        type: 'setQuantity',
        productId: 5,
        quantity,
      })

      expect(state.items).toEqual([])
    })

    it.each([2.5, Number.NaN])('ignores a non-integer quantity (%s)', (quantity) => {
      const initial = withItems([bracelet, 2])

      expect(cartReducer(initial, { type: 'setQuantity', productId: 5, quantity })).toBe(initial)
    })

    it('returns the same state when nothing changes or the product is missing', () => {
      const initial = withItems([bracelet, 2])

      expect(cartReducer(initial, { type: 'setQuantity', productId: 5, quantity: 2 })).toBe(initial)
      expect(cartReducer(initial, { type: 'setQuantity', productId: 99, quantity: 3 })).toBe(
        initial,
      )
    })
  })

  describe('clear', () => {
    it('empties the cart', () => {
      expect(cartReducer(withItems([bracelet, 1], [ring, 1]), { type: 'clear' }).items).toEqual([])
    })

    it('returns the same state when it is already empty', () => {
      expect(cartReducer(EMPTY_CART, { type: 'clear' })).toBe(EMPTY_CART)
    })
  })

  it('never mutates the previous state (frozen inputs would throw)', () => {
    const initial = withItems([bracelet, 1])

    expect(() => {
      cartReducer(initial, { type: 'add', product: bracelet })
      cartReducer(initial, { type: 'setQuantity', productId: 5, quantity: 3 })
      cartReducer(initial, { type: 'remove', productId: 5 })
    }).not.toThrow()
    expect(initial.items[0]?.quantity).toBe(1)
  })
})
