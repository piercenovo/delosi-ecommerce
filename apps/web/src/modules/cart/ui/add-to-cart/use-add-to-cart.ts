'use client'

import { useEffect, useRef, useState } from 'react'
import { MAX_QUANTITY, type CartProduct } from '../../domain/cart'
import { selectItemQuantity, selectTotalItems } from '../../domain/cart-selectors'
import { useCartHydrated, useCartStore } from '../../store/hooks'
import { useCartAnnouncer } from '../CartProvider'

export const ADDED_FEEDBACK_MS = 2000

const plural = (count: number) => `${count} ${count === 1 ? 'producto' : 'productos'}`

/**
 * Shared behaviour of every "add to cart" control: add, announce once in the shared live
 * region, and a short "added" state for visual feedback. Unavailable until the saved cart
 * is read (a click before that would be overwritten by the rehydration) and at 99 units.
 */
export function useAddToCart(product: CartProduct) {
  const hydrated = useCartHydrated()
  const add = useCartStore((state) => state.add)
  const inCart = useCartStore(selectItemQuantity(product.id))
  const total = useCartStore(selectTotalItems)
  const announce = useCartAnnouncer()
  const [justAdded, setJustAdded] = useState(false)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(feedbackTimer.current), [])

  const atLimit = inCart >= MAX_QUANTITY

  function addToCart() {
    if (!hydrated || atLimit) return

    add(product)
    announce(`Agregaste «${product.title}». Tienes ${plural(total + 1)} en el carrito.`)
    setJustAdded(true)
    clearTimeout(feedbackTimer.current)
    feedbackTimer.current = setTimeout(() => setJustAdded(false), ADDED_FEEDBACK_MS)
  }

  return { addToCart, justAdded, inCart, atLimit, hydrated, unavailable: !hydrated || atLimit }
}
