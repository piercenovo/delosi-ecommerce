import { cx, Skeleton } from '@delosi/ui'
import type { Category } from '../../domain/product'
import styles from './CatalogHeading.module.css'

interface CatalogHeadingProps {
  category: Category | null
  count: number
  search?: string | undefined
}

/**
 * The category name is the page title. The count (and the search, if any) is one status
 * message, announced once whenever filters change it.
 */
export function CatalogHeading({ category, count, search }: CatalogHeadingProps) {
  return (
    <div className={styles.heading}>
      <h1 className={styles.title}>{category?.name ?? 'Catálogo'}</h1>
      <p role="status" className={styles.count}>
        {count} {count === 1 ? 'producto' : 'productos'}
        {search && ` para «${search}»`}
      </p>
    </div>
  )
}

/** Placeholder with the same box as CatalogHeading, for loading states. */
export function CatalogHeadingSkeleton() {
  return (
    <div className={styles.heading} aria-hidden="true">
      <Skeleton className={cx(styles.title, styles.titlePlaceholder)} />
    </div>
  )
}
