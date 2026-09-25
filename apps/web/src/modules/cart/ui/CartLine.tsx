'use client'

import { Button } from '@delosi/ui'
import Image from 'next/image'
import Link from 'next/link'
import type { Ref } from 'react'
import { formatPrice } from '@/shared/lib/format-price'
import type { CartItem } from '../domain/cart'
import styles from './CartLine.module.css'
import { QuantityStepper } from './QuantityStepper'

interface CartLineProps {
  item: CartItem
  /** The title link: CartView moves focus here after a neighbour line is removed. */
  linkRef: Ref<HTMLAnchorElement>
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

/** Line total in cents, like the subtotal: 9.99 × 3 is 29.97, not 29.970000000000002. */
const lineTotal = ({ price, quantity }: CartItem) => (Math.round(price * 100) * quantity) / 100

export function CartLine({ item, linkRef, onQuantityChange, onRemove }: CartLineProps) {
  return (
    <li className={styles.line}>
      <div className={styles.media}>
        {/* Decorative: the product name is the link right next to it. */}
        <Image src={item.image} alt="" fill sizes="96px" className={styles.image} />
      </div>
      <div className={styles.info}>
        <h2 className={styles.title}>
          <Link ref={linkRef} href={`/products/${item.productId}`} className={styles.link}>
            {item.title}
          </Link>
        </h2>
        <p className={styles.unitPrice}>{formatPrice(item.price)} cada uno</p>
      </div>
      <div className={styles.controls}>
        <QuantityStepper value={item.quantity} itemLabel={item.title} onChange={onQuantityChange} />
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          aria-label={`Eliminar «${item.title}» del carrito`}
        >
          Eliminar
        </Button>
      </div>
      <p className={styles.total}>{formatPrice(lineTotal(item))}</p>
    </li>
  )
}
