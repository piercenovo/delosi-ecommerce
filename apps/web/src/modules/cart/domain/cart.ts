export const MIN_QUANTITY = 1
export const MAX_QUANTITY = 99

/**
 * What the cart needs from a product. Structural on purpose: the cart module does not import
 * the products module, the page passes these fields in.
 */
export interface CartProduct {
  id: number
  title: string
  price: number
  image: string
}

/** A line of the cart. The price is the one shown when the item was added. */
export interface CartItem {
  productId: number
  title: string
  price: number
  image: string
  quantity: number
}

export interface CartState {
  items: CartItem[]
}

export type CartAction =
  | { type: 'add'; product: CartProduct; quantity?: number }
  | { type: 'remove'; productId: number }
  | { type: 'setQuantity'; productId: number; quantity: number }
  | { type: 'clear' }

export const EMPTY_CART: CartState = { items: [] }

export function toCartItem(product: CartProduct, quantity: number): CartItem {
  return {
    productId: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    quantity,
  }
}
