import { Card } from '@delosi/ui'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { Product } from '../../domain/product'
import styles from './ProductCard.module.css'
import { ProductPrice } from './ProductPrice'
import { ProductRating } from './ProductRating'

/** Matches the grid: 4 columns from 1024px, 3 from 768px, 2 below. */
export const PRODUCT_CARD_IMAGE_SIZES = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw'

interface ProductCardProps {
  product: Product
  /** Above-the-fold card: loads its image eagerly with high fetch priority (LCP candidate). */
  highPriority?: boolean
  /** `h2` in the catalog; `h3` under a section heading (related products). */
  headingLevel?: 'h2' | 'h3'
  /**
   * A card action (quick add to cart), floating over the image corner so it never changes
   * the card's height. A slot: products/ does not import the cart module.
   */
  action?: ReactNode
}

export function ProductCard({
  product,
  highPriority = false,
  headingLevel = 'h2',
  action,
}: ProductCardProps) {
  return (
    <Card className={styles.card}>
      <Card.Media>
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes={PRODUCT_CARD_IMAGE_SIZES}
          {...(highPriority ? { loading: 'eager', fetchPriority: 'high' } : {})}
        />
      </Card.Media>
      <Card.Body>
        <Card.Title as={headingLevel} className={styles.title}>
          <Card.Link as={Link} href={`/products/${product.id}`}>
            {product.title}
          </Card.Link>
        </Card.Title>
        <div className={styles.rating}>
          <ProductRating rating={product.rating} />
        </div>
        <ProductPrice price={product.price} className={styles.price} />
      </Card.Body>
      {/* After the title in the DOM (tab order: title, then action), shown over the image. */}
      {action && <div className={styles.action}>{action}</div>}
    </Card>
  )
}
