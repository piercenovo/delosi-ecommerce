import { Card, Skeleton } from '@delosi/ui'
import a11y from '@/shared/ui/a11y.module.css'
import card from './ProductCard.module.css'
import styles from './product-grid.module.css'

/** Same grid, card box and line heights as ProductGrid: no layout shift when data arrives. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div role="status">
      <span className={a11y.visuallyHidden}>Cargando productos…</span>
      <div aria-hidden="true" className={styles.grid}>
        {Array.from({ length: count }, (_, index) => (
          <Card key={index} variant="plain" className={card.card}>
            <Card.Media>
              <Skeleton variant="rect" />
            </Card.Media>
            <Card.Body>
              <div className={card.title}>
                <Skeleton />
                <Skeleton />
              </div>
              <div className={card.rating}>
                <Skeleton className={card.ratingPlaceholder} />
              </div>
              <div className={card.price}>
                <Skeleton className={card.pricePlaceholder} />
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  )
}
