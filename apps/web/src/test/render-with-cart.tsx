import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { CART_STORAGE_KEY, CART_STORAGE_VERSION } from '@/modules/cart/store/cart-store'
import { CartProvider } from '@/modules/cart/ui/CartProvider'

export interface SavedLine {
  productId: number
  quantity: number
  price?: number
  title?: string
}

/** Writes a cart to localStorage exactly as the store persists it. */
export function saveCart(lines: SavedLine[]): void {
  const items = lines.map(
    ({ productId, quantity, price = 10, title = `Product ${productId}` }) => ({
      productId,
      title,
      price,
      image: `/images/products/${productId}.png`,
      quantity,
    }),
  )
  window.localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify({ state: { items }, version: CART_STORAGE_VERSION }),
  )
}

/** Renders with the real cart store (jsdom's localStorage) and the shared announcer. */
export function renderWithCart(ui: ReactElement) {
  return render(<CartProvider>{ui}</CartProvider>)
}
