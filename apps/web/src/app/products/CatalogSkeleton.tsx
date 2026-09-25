import { Skeleton } from '@delosi/ui'
import { CatalogHeadingSkeleton } from '@/modules/products/ui/CatalogHeading'
import { ProductGridSkeleton } from '@/modules/products/ui/ProductGridSkeleton'
import styles from './CatalogSkeleton.module.css'
import page from './page.module.css'

const CHIP_WIDTHS = ['3.5rem', '6.5rem', '5rem', '8.5rem', '8rem']

/** The whole catalog, same boxes: heading, filters, controls and grid. */
export function CatalogSkeleton() {
  return (
    <>
      <CatalogHeadingSkeleton />
      <div className={page.toolbar} aria-hidden="true">
        <div className={styles.chips}>
          {CHIP_WIDTHS.map((width) => (
            <Skeleton key={width} variant="rect" className={styles.chip} style={{ width }} />
          ))}
        </div>
        <div className={styles.controls}>
          <Skeleton variant="rect" className={styles.search} />
          <Skeleton variant="rect" className={styles.sort} />
        </div>
      </div>
      <ProductGridSkeleton />
    </>
  )
}
