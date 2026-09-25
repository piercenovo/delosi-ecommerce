import type { SortKey } from './catalog-query'
import type { Product } from './product'

export type ProductComparator = (a: Product, b: Product) => number

const nameCollator = new Intl.Collator('es', { sensitivity: 'base' })

/**
 * One comparator per sort key (Strategy). Adding a sort criterion means adding an
 * entry here; `sortProducts` does not change.
 */
export const SORT_STRATEGIES: Readonly<Record<SortKey, ProductComparator>> = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating.rate - a.rating.rate || b.rating.count - a.rating.count,
  name: (a, b) => nameCollator.compare(a.title, b.title),
}

/** Returns a new, deterministically ordered array (ties are broken by id). */
export function sortProducts(products: readonly Product[], sort?: SortKey): Product[] {
  if (!sort) return [...products]

  const compare = SORT_STRATEGIES[sort]
  return [...products].sort((a, b) => compare(a, b) || a.id - b.id)
}
