'use client'

import { createContext, use, useState, type ReactNode } from 'react'
import a11y from '@/shared/ui/a11y.module.css'
import { CartStoreProvider } from '../store/CartStoreProvider'

type Announce = (message: string) => void

const CartAnnouncerContext = createContext<Announce | null>(null)

/**
 * Everything the cart needs, mounted once in the root layout: the store, and a single live
 * region shared by every add-to-cart control (the product page and each catalog card), so
 * twenty cards do not mean twenty live regions.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')

  return (
    <CartStoreProvider>
      <CartAnnouncerContext value={setMessage}>
        {children}
        <p role="status" className={a11y.visuallyHidden}>
          {message}
        </p>
      </CartAnnouncerContext>
    </CartStoreProvider>
  )
}

export function useCartAnnouncer(): Announce {
  const announce = use(CartAnnouncerContext)
  if (!announce) throw new Error('useCartAnnouncer must be used inside <CartProvider>.')
  return announce
}
