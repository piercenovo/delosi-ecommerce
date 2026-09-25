import { cx } from '@delosi/ui'
import { formatPrice } from '@/shared/lib/format-price'
import styles from './ProductPrice.module.css'

interface ProductPriceProps {
  price: number
  size?: 'md' | 'lg'
  className?: string | undefined
}

/** `<data>` keeps the machine-readable amount next to the formatted one. */
export function ProductPrice({ price, size = 'md', className }: ProductPriceProps) {
  return (
    <data value={price.toFixed(2)} className={cx(styles.price, styles[size], className)}>
      {formatPrice(price)}
    </data>
  )
}
