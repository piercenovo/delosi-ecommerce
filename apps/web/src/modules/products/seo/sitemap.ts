import type { MetadataRoute } from 'next'
import { buildCatalogHref } from '../catalog-search-params'
import type { Category, Product } from '../domain/product'

/**
 * Exactly the canonical URLs (see buildCatalogMetadata). No `lastModified`: the source has
 * no dates, and a made-up lastmod teaches crawlers to ignore it.
 */
export function buildSitemap(
  siteUrl: string,
  products: readonly Product[],
  categories: readonly Category[],
): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}${buildCatalogHref({})}`, changeFrequency: 'daily', priority: 1 },
    ...categories.map(({ slug }) => ({
      url: `${siteUrl}${buildCatalogHref({ category: slug })}`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...products.map(({ id }) => ({
      url: `${siteUrl}/products/${id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}
