import type { CartProduct } from '@/modules/cart/domain/cart'
import type { Product } from '@/modules/products/domain/product'

/** The routes compose both modules: this is the only place a Product becomes a CartProduct. */
export function toCartProduct({ id, title, price, image }: Product): CartProduct {
  return { id, title, price, image }
}
