import type { Rating } from '../domain/product'
import styles from './ProductRating.module.css'

const rateFormatter = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const countFormatter = new Intl.NumberFormat('es-PE')

/** Compact rating for sighted users ("★ 4.1 (259)"), a full sentence for screen readers. */
export function ProductRating({ rating }: { rating: Rating }) {
  const rate = rateFormatter.format(rating.rate)
  const count = countFormatter.format(rating.count)
  const reviews = rating.count === 1 ? 'reseña' : 'reseñas'

  return (
    <span
      role="img"
      aria-label={`Valoración ${rate} de 5, ${count} ${reviews}`}
      className={styles.rating}
    >
      <svg className={styles.star} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
      </svg>
      <span className={styles.rate}>{rate}</span>
      <span className={styles.count}>({count})</span>
    </span>
  )
}
