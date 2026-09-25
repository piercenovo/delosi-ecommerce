import type { BreadcrumbItem } from '@/shared/ui/Breadcrumbs'
import type { Category, Product } from '../domain/product'

type JsonLd = Record<string, unknown>

/**
 * schema.org Product for rich results. No `brand`: the source data has none, and structured
 * data must match what the page shows. Stock is not tracked, so every product is InStock.
 */
export function buildProductJsonLd(
  product: Product,
  category: Category | null,
  siteUrl: string,
): JsonLd {
  const url = `${siteUrl}/products/${product.id}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    sku: String(product.id),
    name: product.title,
    description: product.description,
    image: new URL(product.image, siteUrl).href,
    url,
    ...(category ? { category: category.name } : {}),
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url,
    },
    ...(product.rating.count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating.rate,
            reviewCount: product.rating.count,
            bestRating: 5,
          },
        }
      : {}),
  }
}

/** The same trail the page shows; the last item (current page) has no URL. */
export function buildBreadcrumbJsonLd(items: readonly BreadcrumbItem[], siteUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  }
}

/**
 * JSON for a `<script type="application/ld+json">`. Escaping `<` keeps data such as
 * "</script>" from closing the tag and injecting HTML; JSON parsers read `<` back as `<`.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
