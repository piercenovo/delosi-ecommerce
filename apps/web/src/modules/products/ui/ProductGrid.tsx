import type { Product } from '../domain/product'
import { ProductCard } from './ProductCard'
import styles from './product-grid.module.css'

/** One desktop row: the images most likely to be the LCP element. */
export const PRIORITY_IMAGE_COUNT = 4

export function ProductGrid({ products }: { products: readonly Product[] }) {
  return (
    // role="list" restores list semantics that Safari drops with `list-style: none`.
    <ul role="list" aria-label="Productos" className={styles.grid}>
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} highPriority={index < PRIORITY_IMAGE_COUNT} />
        </li>
      ))}
    </ul>
  )
}
