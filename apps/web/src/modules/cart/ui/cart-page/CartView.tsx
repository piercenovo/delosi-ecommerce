'use client'

import { Button, EmptyState, Skeleton } from '@delosi/ui'
import Link from 'next/link'
import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { formatPrice } from '@/shared/lib/format-price'
import a11y from '@/shared/ui/a11y.module.css'
import { selectSubtotal, selectTotalItems } from '../../domain/cart-selectors'
import { useCartHydrated, useCartStore } from '../../store/hooks'
import { CartLine } from './CartLine'
import styles from './CartView.module.css'

const SUMMARY_HEADING_ID = 'cart-summary'

/**
 * The /cart page body. The saved cart only exists in the browser, so the server (and the
 * first render) show a placeholder. Removing a line moves focus to a neighbour line, or to
 * the page title when the cart empties, so keyboard users never land on <body>.
 */
export function CartView() {
  const hydrated = useCartHydrated()
  const items = useCartStore((state) => state.items)
  const totalItems = useCartStore(selectTotalItems)
  const subtotal = useCartStore(selectSubtotal)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const remove = useCartStore((state) => state.remove)
  const clear = useCartStore((state) => state.clear)

  const headingRef = useRef<HTMLHeadingElement>(null)
  const linkRefs = useRef(new Map<number, HTMLAnchorElement>())

  function handleRemove(productId: number) {
    const index = items.findIndex((item) => item.productId === productId)
    const neighbour = items[index + 1] ?? items[index - 1]

    // Commit the removal to the DOM now, so the next element to focus exists.
    flushSync(() => remove(productId))
    const target = neighbour ? linkRefs.current.get(neighbour.productId) : headingRef.current
    target?.focus()
  }

  function handleClear() {
    flushSync(clear)
    headingRef.current?.focus()
  }

  return (
    <div className={styles.cart}>
      <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
        Tu carrito
      </h1>

      {!hydrated ? (
        <CartSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          title="Tu carrito está vacío"
          description="Agrega productos desde el catálogo y aparecerán aquí."
          action={
            <Button as={Link} href="/products">
              Ver el catálogo
            </Button>
          }
        />
      ) : (
        <div className={styles.layout}>
          <ul role="list" aria-label="Productos en tu carrito" className={styles.lines}>
            {items.map((item) => (
              <CartLine
                key={item.productId}
                item={item}
                linkRef={(element) => {
                  if (element) linkRefs.current.set(item.productId, element)
                  return () => {
                    linkRefs.current.delete(item.productId)
                  }
                }}
                onQuantityChange={(quantity) => setQuantity(item.productId, quantity)}
                onRemove={() => handleRemove(item.productId)}
              />
            ))}
          </ul>

          <section aria-labelledby={SUMMARY_HEADING_ID} className={styles.summary}>
            <h2 id={SUMMARY_HEADING_ID} className={styles.summaryTitle}>
              Resumen
            </h2>
            <dl className={styles.totals}>
              <div className={styles.row}>
                <dt>Productos</dt>
                <dd>{totalItems}</dd>
              </div>
              <div className={styles.row}>
                <dt>Subtotal</dt>
                <dd className={styles.subtotal}>{formatPrice(subtotal)}</dd>
              </div>
            </dl>
            <p className={styles.note}>El pago no forma parte de esta demo.</p>
            <Button variant="secondary" fullWidth onClick={handleClear}>
              Vaciar carrito
            </Button>
          </section>
        </div>
      )}
    </div>
  )
}

function CartSkeleton() {
  return (
    <div role="status">
      <span className={a11y.visuallyHidden}>Cargando tu carrito…</span>
      <div aria-hidden="true" className={styles.layout}>
        <div className={styles.lines}>
          {[0, 1].map((line) => (
            <div key={line} className={styles.skeletonLine}>
              <Skeleton variant="rect" className={styles.skeletonMedia} />
              <div>
                <Skeleton />
                <Skeleton />
              </div>
            </div>
          ))}
        </div>
        <Skeleton variant="rect" className={styles.skeletonSummary} />
      </div>
    </div>
  )
}
