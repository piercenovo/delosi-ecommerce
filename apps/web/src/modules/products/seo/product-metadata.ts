import type { Metadata } from 'next'
import type { Product } from '../domain/product'

/** Search engines show about 155–160 characters of a description. */
export const META_DESCRIPTION_MAX = 160

function summarize(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean

  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:]+$/, '')}…`
}

/**
 * Relative URLs resolve against `metadataBase` (root layout). Image dimensions are omitted on
 * purpose: product images come in any size, and declaring 1200×630 would be false.
 */
export function buildProductMetadata(product: Product): Metadata {
  const url = `/products/${product.id}`
  const description = summarize(product.description, META_DESCRIPTION_MAX)

  return {
    title: product.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: product.title,
      description,
      images: [{ url: product.image, alt: product.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: [product.image],
    },
  }
}
