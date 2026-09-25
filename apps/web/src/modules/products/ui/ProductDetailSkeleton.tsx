import { Skeleton } from '@delosi/ui'
import a11y from '@/shared/ui/a11y.module.css'
import breadcrumbs from '@/shared/ui/Breadcrumbs.module.css'
import styles from './ProductDetail.module.css'
import skeleton from './ProductDetailSkeleton.module.css'

/** Same breadcrumbs row and image box as the page: the LCP image lands where its box was. */
export function ProductDetailSkeleton() {
  return (
    <div role="status">
      <span className={a11y.visuallyHidden}>Cargando producto…</span>
      <div aria-hidden="true">
        <div className={breadcrumbs.breadcrumbs}>
          <Skeleton className={skeleton.breadcrumbs} />
        </div>
        <div className={styles.detail}>
          <div className={styles.media}>
            <div className={styles.frame}>
              <Skeleton variant="rect" />
            </div>
          </div>
          <div className={styles.info}>
            <div className={skeleton.title}>
              <Skeleton />
              <Skeleton />
            </div>
            <Skeleton className={skeleton.short} />
            <Skeleton className={skeleton.price} />
            <div className={styles.actions} />
            <div className={styles.description}>
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
