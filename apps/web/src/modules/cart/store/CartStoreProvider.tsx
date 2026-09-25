'use client'

import { createContext, useEffect, useState, type ReactNode } from 'react'
import { CART_STORAGE_KEY, createCartStore, type CartStore } from './cart-store'

export const CartStoreContext = createContext<CartStore | null>(null)

/**
 * Creates one cart store for this browser tab (never shared across server requests), loads
 * the saved cart after mount, and reloads it when another tab changes it.
 */
export function CartStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createCartStore)

  useEffect(() => {
    void store.persist.rehydrate()

    const syncFromOtherTab = (event: StorageEvent) => {
      // `key` is null when another tab clears the whole storage.
      if (event.key === CART_STORAGE_KEY || event.key === null) void store.persist.rehydrate()
    }
    window.addEventListener('storage', syncFromOtherTab)
    return () => window.removeEventListener('storage', syncFromOtherTab)
  }, [store])

  return <CartStoreContext value={store}>{children}</CartStoreContext>
}
