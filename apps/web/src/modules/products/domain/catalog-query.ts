export const SORT_KEYS = ['price-asc', 'price-desc', 'rating', 'name'] as const

export type SortKey = (typeof SORT_KEYS)[number]

/** What the shopper asked for. Every field is optional; absent means "no constraint". */
export interface CatalogQuery {
  /** Category slug, e.g. `mens-clothing`. */
  category?: string | undefined
  /** Free-text search over title and description. */
  q?: string | undefined
  sort?: SortKey | undefined
}
