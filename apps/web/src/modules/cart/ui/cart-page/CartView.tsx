'use client'

import { Button, EmptyState, Skeleton } from '@delosi/ui'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { formatPrice } from '@/shared/lib/format-price'
import a11y from '@/shared/ui/a11y.module.css'
import type { CartItem } from '../../domain/cart'
import { selectSubtotal, selectTotalItems } from '../../domain/cart-selectors'
import { useCartHydrated, useCartStore } from '../../store/hooks'
import { useCartAnnouncer } from '../CartProvider'
import { CartLine } from './CartLine'
import styles from './CartView.module.css'

const SUMMARY_HEADING_ID = 'cart-summary'

const units = (count: number) => `${count} ${count === 1 ? 'producto' : 'productos'}`
const countUnits = (items: readonly CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0)

/**
 * The /cart page body. The saved cart only exists in the browser, so the server (and the
 * first render) show a placeholder. Removing a line moves focus to a neighbour line, or to
 * the page title when the cart empties, so keyboard users never land on <body>.
 *
 * Emptying the cart asks nothing: recovery is safe, so it offers "Deshacer" instead of a
 * confirmation. There is no timer (a time limit would be a barrier, WCAG 2.2.1): undo stays
 * available until the visitor leaves the page.
 */
export function CartView() {
  const hydrated = useCartHydrated()
  const items = useCartStore((state) => state.items)
  const totalItems = useCartStore(selectTotalItems)
  const subtotal = useCartStore(selectSubtotal)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const remove = useCartStore((state) => state.remove)
  const clear = useCartStore((state) => state.clear)
  const add = useCartStore((state) => state.add)
  const announce = useCartAnnouncer()

  // The lines removed by "Vaciar carrito", kept only while the cart stays empty.
  const [cleared, setCleared] = useState<readonly CartItem[] | null>(null)
  if (cleared && items.length > 0) setCleared(null) // refilled elsewhere (another tab)

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
    const removed = items
    flushSync(() => {
      clear()
      setCleared(removed)
    })
    headingRef.current?.focus()
    announce('Vaciaste tu carrito. Puedes deshacerlo con el botón Deshacer.')
  }

  function handleUndo() {
    if (!cleared) return
    const restored = cleared
    // One commit for every line, so the first line's link exists when it gets the focus.
    flushSync(() => {
      for (const { productId, title, price, image, quantity } of restored) {
        add({ id: productId, title, price, image }, quantity)
      }
      setCleared(null)
    })
    const first = restored[0]
    if (first) linkRefs.current.get(first.productId)?.focus()
    announce(`Recuperaste ${units(countUnits(restored))}.`)
  }

  return (
    <div className={styles.cart}>
      <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
        Tu carrito
      </h1>

      {!hydrated ? (
        <CartSkeleton />
      ) : items.length === 0 && cleared ? (
        <EmptyState
          title="Vaciaste tu carrito"
          description={`Quitamos ${units(countUnits(cleared))}.`}
          action={
            <div className={styles.emptyActions}>
              <Button onClick={handleUndo}>Deshacer</Button>
              <Button as={Link} href="/products" variant="secondary">
                Ver el catálogo
              </Button>
            </div>
          }
        />
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
            <Button as={Link} href="/products" fullWidth>
              Seguir comprando
            </Button>
            {/* A minor action: it can be undone, so it never competes with the main one. */}
            <Button variant="ghost" size="sm" onClick={handleClear} className={styles.clear}>
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
