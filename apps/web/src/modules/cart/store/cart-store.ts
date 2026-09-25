import { z } from 'zod'
import { persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'
import {
  EMPTY_CART,
  MAX_QUANTITY,
  type CartAction,
  type CartProduct,
  type CartState,
} from '../domain/cart'
import { cartReducer } from '../domain/cart-reducer'
import { createSafeJsonStorage } from './safe-storage'

export const CART_STORAGE_KEY = 'delosi-cart'
/** Bump when the persisted shape changes, and handle the old one in `migrate`. */
export const CART_STORAGE_VERSION = 1

export interface CartActions {
  add(product: CartProduct, quantity?: number): void
  remove(productId: number): void
  setQuantity(productId: number, quantity: number): void
  clear(): void
}

export type CartStoreState = CartState & CartActions
export type CartStore = ReturnType<typeof createCartStore>

// localStorage is user-editable input: validate it before it reaches the UI. Images must be
// local paths, or next/image would reject an unknown host at render time.
const persistedCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.number().int().positive(),
      title: z.string().min(1).max(300),
      price: z.number().finite().nonnegative(),
      image: z.string().regex(/^\/(?!\/)/),
      quantity: z.number().int().min(1).max(MAX_QUANTITY),
    }),
  ),
})

interface CartStoreOptions {
  /** Defaults to `window.localStorage`; tests pass an in-memory one. */
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
}

/**
 * One store per CartStoreProvider (never a module singleton, which would be shared across
 * requests during SSR). Hydration from storage is explicit (`skipHydration`), so the server
 * HTML and the first client render both show an empty, not-yet-hydrated cart.
 */
export function createCartStore({ storage }: CartStoreOptions = {}) {
  return createStore<CartStoreState>()(
    persist(
      (set) => {
        const dispatch = (action: CartAction) =>
          set((state) => {
            const next = cartReducer(state, action)
            // Same object when nothing changed: Zustand then skips notifying subscribers.
            return next === state ? state : { items: next.items }
          })

        return {
          ...EMPTY_CART,
          add: (product, quantity) =>
            dispatch(
              quantity === undefined
                ? { type: 'add', product }
                : { type: 'add', product, quantity },
            ),
          remove: (productId) => dispatch({ type: 'remove', productId }),
          setQuantity: (productId, quantity) =>
            dispatch({ type: 'setQuantity', productId, quantity }),
          clear: () => dispatch({ type: 'clear' }),
        }
      },
      {
        name: CART_STORAGE_KEY,
        version: CART_STORAGE_VERSION,
        storage: createSafeJsonStorage<CartState>(() => storage ?? window.localStorage),
        partialize: (state): CartState => ({ items: state.items }),
        skipHydration: true,
        // No older version exists yet: an unknown one is discarded instead of guessed.
        migrate: () => EMPTY_CART,
        // Never throws (persist would stay "not hydrated" forever): invalid data is dropped.
        merge: (persisted, current) => {
          const parsed = persistedCartSchema.safeParse(persisted)
          return parsed.success ? { ...current, items: parsed.data.items } : current
        },
      },
    ),
  )
}
