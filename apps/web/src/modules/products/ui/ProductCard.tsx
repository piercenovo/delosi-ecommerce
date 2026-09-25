import { Card } from '@delosi/ui'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '../domain/product'
import styles from './ProductCard.module.css'
import { ProductPrice } from './ProductPrice'
import { ProductRating } from './ProductRating'

/** Matches the grid: 4 columns from 1024px, 3 from 768px, 2 below. */
export const PRODUCT_CARD_IMAGE_SIZES = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw'

interface ProductCardProps {
  product: Product
  /** Above-the-fold card: loads its image eagerly with high fetch priority (LCP candidate). */
  highPriority?: boolean
}

export function ProductCard({ product, highPriority = false }: ProductCardProps) {
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
        <Card.Title as="h2" className={styles.title}>
          <Card.Link as={Link} href={`/products/${product.id}`}>
            {product.title}
          </Card.Link>
        </Card.Title>
        <div className={styles.rating}>
          <ProductRating rating={product.rating} />
        </div>
        <ProductPrice price={product.price} className={styles.price} />
      </Card.Body>
    </Card>
  )
}
