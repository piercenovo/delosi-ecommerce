import Image from 'next/image'
import type { ReactNode } from 'react'
import type { Product } from '../domain/product'
import styles from './ProductDetail.module.css'
import { ProductPrice } from './ProductPrice'
import { ProductRating } from './ProductRating'

/** Two columns from 768px inside an 80rem layout: at most ~584px wide. */
export const PRODUCT_DETAIL_IMAGE_SIZES =
  '(min-width: 1280px) 584px, (min-width: 768px) 50vw, 100vw'

interface ProductDetailProps {
  product: Product
  /** Purchase actions (add to cart). Its space is reserved so they never shift the layout. */
  actions?: ReactNode
}

export function ProductDetail({ product, actions }: ProductDetailProps) {
  return (
    <article className={styles.detail}>
      <div className={styles.media}>
        <div className={styles.frame}>
          <Image
            src={product.image}
            alt={product.title}
            fill
            preload
            sizes={PRODUCT_DETAIL_IMAGE_SIZES}
            className={styles.image}
          />
        </div>
      </div>
      <div className={styles.info}>
        <h1 className={styles.title}>{product.title}</h1>
        <ProductRating rating={product.rating} />
        <ProductPrice price={product.price} size="lg" className={styles.price} />
        <div className={styles.actions}>{actions}</div>
        <section aria-labelledby="product-description" className={styles.description}>
          <h2 id="product-description" className={styles.descriptionTitle}>
            Descripción
          </h2>
          <p>{product.description}</p>
        </section>
      </div>
    </article>
  )
}
