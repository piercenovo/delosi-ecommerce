import type { ReactNode } from 'react'
import type { Product } from '../../domain/product'
import { ProductCard } from './ProductCard'
import styles from './product-grid.module.css'

/** One desktop row: the images most likely to be the LCP element. */
export const PRIORITY_IMAGE_COUNT = 4

interface ProductGridProps {
  products: readonly Product[]
  /** Accessible name of the list. */
  label?: string
  /** How many leading images load with high priority; 0 below the fold. */
  priorityCount?: number
  headingLevel?: 'h2' | 'h3'
  /** Per-card action (quick add), composed by the page. */
  renderAction?: (product: Product) => ReactNode
}

export function ProductGrid({
  products,
  label = 'Productos',
  priorityCount = PRIORITY_IMAGE_COUNT,
  headingLevel = 'h2',
  renderAction,
}: ProductGridProps) {
  return (
    // role="list" restores list semantics that Safari drops with `list-style: none`.
    <ul role="list" aria-label={label} className={styles.grid}>
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            highPriority={index < priorityCount}
            headingLevel={headingLevel}
            action={renderAction?.(product)}
          />
        </li>
      ))}
    </ul>
  )
}
