import { Skeleton } from '@delosi/ui'
import type { Product } from '../domain/product'
import { ProductGrid } from './ProductGrid'
import { ProductGridSkeleton } from './ProductGridSkeleton'
import styles from './RelatedProducts.module.css'

const TITLE = 'También te puede interesar'
const HEADING_ID = 'related-products'

/** Below the fold: no priority images, card titles nested under the section heading. */
export function RelatedProducts({ products }: { products: readonly Product[] }) {
  if (products.length === 0) return null

  return (
    <section aria-labelledby={HEADING_ID} className={styles.related}>
      <h2 id={HEADING_ID} className={styles.title}>
        {TITLE}
      </h2>
      <ProductGrid
        products={products}
        label="Productos relacionados"
        priorityCount={0}
        headingLevel="h3"
      />
    </section>
  )
}

export function RelatedProductsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={styles.related}>
      <Skeleton aria-hidden="true" className={styles.titlePlaceholder} />
      <ProductGridSkeleton count={count} />
    </div>
  )
}
