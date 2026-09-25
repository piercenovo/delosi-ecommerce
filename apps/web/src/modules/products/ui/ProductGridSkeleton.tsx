import { Card, Skeleton } from '@delosi/ui'
import a11y from '@/shared/ui/a11y.module.css'
import card from './ProductCard.module.css'
import styles from './product-grid.module.css'

const PLACEHOLDER_COUNT = 8

/** Same grid, card box and line heights as ProductGrid: no layout shift when data arrives. */
export function ProductGridSkeleton() {
  return (
    <div role="status">
      <span className={a11y.visuallyHidden}>Cargando productos…</span>
      <div aria-hidden="true" className={styles.grid}>
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
          <Card key={index} className={card.card}>
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
