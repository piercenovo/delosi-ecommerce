'use client'

import { Button, cx } from '@delosi/ui'
import Link from 'next/link'
import { MAX_QUANTITY, type CartProduct } from '../../domain/cart'
import styles from './AddToCartButton.module.css'
import { CheckIcon } from '../icons'
import { useAddToCart } from './use-add-to-cart'

/**
 * The product page's add-to-cart button. It always reserves the space of its helper line,
 * so nothing below it moves when the line appears.
 */
export function AddToCartButton({ product }: { product: CartProduct }) {
  const { addToCart, justAdded, inCart, atLimit, hydrated, unavailable } = useAddToCart(product)

  return (
    <div className={styles.addToCart}>
      <Button
        variant={justAdded ? 'highlight' : 'primary'}
        size="lg"
        onClick={addToCart}
        disabled={unavailable}
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
    </div>
  )
}
