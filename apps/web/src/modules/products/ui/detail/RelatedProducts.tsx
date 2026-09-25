import type { ReactNode } from 'react'
import type { Product } from '../../domain/product'
import { ProductGrid } from '../product/ProductGrid'
import styles from './RelatedProducts.module.css'

const TITLE = 'También te puede interesar'
const HEADING_ID = 'related-products'

/** Below the fold: no priority images, card titles nested under the section heading. */
interface RelatedProductsProps {
  products: readonly Product[]
  renderAction?: (product: Product) => ReactNode
}

export function RelatedProducts({ products, renderAction }: RelatedProductsProps) {
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
        {...(renderAction ? { renderAction } : {})}
      />
    </section>
  )
}
