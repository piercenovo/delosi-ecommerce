'use client'

import { use, useSyncExternalStore } from 'react'
import { useStore } from 'zustand'
import type { CartStore, CartStoreState } from './cart-store'
import { CartStoreContext } from './CartStoreProvider'

function useCartStoreApi(): CartStore {
  const store = use(CartStoreContext)
  if (!store) throw new Error('Cart hooks must be used inside <CartStoreProvider>.')
  return store
}

/**
 * Subscribes to one slice of the cart: the component re-renders only when that slice
 * changes. Selectors must return stable values (a primitive or a stored reference); for a
 * derived object, wrap the selector with `useShallow`.
 */
export function useCartStore<T>(selector: (state: CartStoreState) => T): T {
  return useStore(useCartStoreApi(), selector)
}

/**
 * False on the server and until the saved cart has been read. Components render a
 * same-size placeholder meanwhile: no hydration mismatch, no layout shift.
 */
export function useCartHydrated(): boolean {
  const store = useCartStoreApi()
  return useSyncExternalStore(
    (onChange) => {
      const unsubscribeStart = store.persist.onHydrate(onChange)
      const unsubscribeFinish = store.persist.onFinishHydration(onChange)
      return () => {
        unsubscribeStart()
        unsubscribeFinish()
      }
    },
    () => store.persist.hasHydrated(),
    () => false,
  )
}
