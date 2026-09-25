import type { CartState } from './cart'

export function selectTotalItems(state: CartState): number {
  return state.items.reduce((total, item) => total + item.quantity, 0)
}

/** Summed in cents, so 0.1 + 0.2 is 0.3 and not 0.30000000000000004. */
export function selectSubtotal(state: CartState): number {
  const cents = state.items.reduce(
    (total, item) => total + Math.round(item.price * 100) * item.quantity,
    0,
  )
  return cents / 100
}

/** Selector factory: `useCartStore(selectItemQuantity(id))` re-renders only for that line. */
export function selectItemQuantity(productId: number) {
  return (state: CartState): number =>
    state.items.find((item) => item.productId === productId)?.quantity ?? 0
}
