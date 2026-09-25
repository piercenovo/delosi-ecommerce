'use client'

import { Badge } from '@delosi/ui'
import Link from 'next/link'
import { selectTotalItems } from '../domain/cart-selectors'
import { useCartHydrated, useCartStore } from '../store/hooks'
import styles from './CartBadge.module.css'
import { CartIcon } from './icons'

const MAX_VISIBLE_COUNT = 99

function accessibleName(hydrated: boolean, total: number): string {
  if (!hydrated) return 'Carrito'
  if (total === 0) return 'Carrito vacío'
  return `Carrito, ${total} ${total === 1 ? 'producto' : 'productos'}`
}

/**
 * Header link to the cart. The count sits on top of the icon (absolutely positioned) in a
 * fixed-size link, so it never moves the layout, before or after the saved cart is read.
 * Not a live region: the add-to-cart button announces changes, once.
 */
export function CartBadge() {
  const hydrated = useCartHydrated()
  const total = useCartStore(selectTotalItems)
  const visibleCount = total > MAX_VISIBLE_COUNT ? `${MAX_VISIBLE_COUNT}+` : String(total)

  return (
    <Link href="/cart" aria-label={accessibleName(hydrated, total)} className={styles.link}>
      <CartIcon className={styles.icon} />
      {hydrated && total > 0 && (
        <Badge tone="highlight" aria-hidden="true" className={styles.count}>
          {visibleCount}
        </Badge>
      )}
    </Link>
  )
}
