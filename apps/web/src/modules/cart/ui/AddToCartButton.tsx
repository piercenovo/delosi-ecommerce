'use client'

import { Button, cx } from '@delosi/ui'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import a11y from '@/shared/ui/a11y.module.css'
import { MAX_QUANTITY, type CartProduct } from '../domain/cart'
import { selectItemQuantity, selectTotalItems } from '../domain/cart-selectors'
import { useCartHydrated, useCartStore } from '../store/hooks'
import styles from './AddToCartButton.module.css'
import { CheckIcon } from './icons'

export const ADDED_FEEDBACK_MS = 2000

const plural = (count: number) => `${count} ${count === 1 ? 'producto' : 'productos'}`

/**
 * Adds the product to the cart. Disabled until the saved cart is read (a click before that
 * would be overwritten by the rehydration). Announces each addition once, in its own live
 * region, and always reserves the space of its helper line so nothing below it moves.
 */
export function AddToCartButton({ product }: { product: CartProduct }) {
  const hydrated = useCartHydrated()
  const add = useCartStore((state) => state.add)
  const inCart = useCartStore(selectItemQuantity(product.id))
  const total = useCartStore(selectTotalItems)
  const [justAdded, setJustAdded] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(feedbackTimer.current), [])

  const atLimit = inCart >= MAX_QUANTITY

  function handleClick() {
    add(product)
    setAnnouncement(`Agregaste «${product.title}». Tienes ${plural(total + 1)} en el carrito.`)
    setJustAdded(true)
    clearTimeout(feedbackTimer.current)
    feedbackTimer.current = setTimeout(() => setJustAdded(false), ADDED_FEEDBACK_MS)
  }

  return (
    <div className={styles.addToCart}>
      <Button
        size="lg"
        onClick={handleClick}
        disabled={!hydrated || atLimit}
        className={styles.button}
      >
        {/* Both labels share one grid cell: the button keeps the width of the longer one.
            aria-hidden keeps the accessible name right without relying on CSS. */}
        <span className={styles.labels}>
          <span aria-hidden={justAdded} className={cx(styles.label, justAdded && styles.hidden)}>
            Agregar al carrito
          </span>
          <span aria-hidden={!justAdded} className={cx(styles.label, !justAdded && styles.hidden)}>
            <CheckIcon className={styles.check} />
            Agregado
          </span>
        </span>
      </Button>
      <p className={styles.helper}>
        {hydrated && atLimit && `Llegaste al máximo de ${MAX_QUANTITY} unidades.`}
        {hydrated && inCart > 0 && !atLimit && (
          <>
            Ya tienes {inCart} en tu carrito. <Link href="/cart">Ver carrito</Link>
          </>
        )}
      </p>
      <p role="status" className={a11y.visuallyHidden}>
        {announcement}
      </p>
    </div>
  )
}
