import { parseProductId, type ProductId } from '../domain/product'

export const CATALOG_CACHE_TAGS = {
  products: 'products',
  categories: 'categories',
  product: (id: ProductId) => `product:${id}`,
} as const

const PRODUCT_TAG_PREFIX = 'product:'

/** Allowlist for on-demand revalidation: only tags this app actually sets. */
export function isCatalogCacheTag(tag: string): boolean {
  if (tag === CATALOG_CACHE_TAGS.products || tag === CATALOG_CACHE_TAGS.categories) return true
  if (!tag.startsWith(PRODUCT_TAG_PREFIX)) return false
  return parseProductId(tag.slice(PRODUCT_TAG_PREFIX.length)) !== null
}
