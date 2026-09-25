'use client'

import { IconButton } from '@delosi/ui'
import type { CartProduct } from '../domain/cart'
import { CartPlusIcon, CheckIcon } from './icons'
import { useAddToCart } from './use-add-to-cart'

/**
 * Icon-only add-to-cart for catalog cards. A cart-with-plus icon (a lone "+" could mean
 * favourites or compare) and a full accessible name; the result is announced once in the
 * shared live region, and a check mark confirms it visually for a moment.
 */
export function QuickAddButton({ product }: { product: CartProduct }) {
  const { addToCart, justAdded, unavailable } = useAddToCart(product)

  return (
    <IconButton
      variant="secondary"
      size="sm"
      aria-label={`Agregar «${product.title}» al carrito`}
      disabled={unavailable}
      onClick={addToCart}
    >
      {justAdded ? <CheckIcon /> : <CartPlusIcon />}
    </IconButton>
  )
}
