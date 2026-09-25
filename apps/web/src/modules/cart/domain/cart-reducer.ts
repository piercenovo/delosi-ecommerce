import { MAX_QUANTITY, toCartItem, type CartAction, type CartItem, type CartState } from './cart'

function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity)
}

function clamp(quantity: number): number {
  return Math.min(quantity, MAX_QUANTITY)
}

function replaceLine(state: CartState, productId: number, next: CartItem | null): CartState {
  return {
    items: next
      ? state.items.map((item) => (item.productId === productId ? next : item))
      : state.items.filter((item) => item.productId !== productId),
  }
}

/**
 * All cart rules live here, framework-free: Zustand only holds the result. It never mutates
 * its input and returns the same state object when an action changes nothing, so
 * subscribers do not re-render for no-ops.
 */
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const quantity = action.quantity ?? 1
      if (!isValidQuantity(quantity) || quantity < 1) return state

      const existing = state.items.find((item) => item.productId === action.product.id)
      if (!existing) return { items: [...state.items, toCartItem(action.product, clamp(quantity))] }

      const next = clamp(existing.quantity + quantity)
      return next === existing.quantity
        ? state
        : replaceLine(state, existing.productId, { ...existing, quantity: next })
    }

    case 'remove':
      return state.items.some((item) => item.productId === action.productId)
        ? replaceLine(state, action.productId, null)
        : state

    case 'setQuantity': {
      if (!isValidQuantity(action.quantity)) return state

      const existing = state.items.find((item) => item.productId === action.productId)
      if (!existing) return state
      if (action.quantity < 1) return replaceLine(state, action.productId, null)

      const next = clamp(action.quantity)
      return next === existing.quantity
        ? state
        : replaceLine(state, action.productId, { ...existing, quantity: next })
    }

    case 'clear':
      return state.items.length === 0 ? state : { items: [] }
  }
}
