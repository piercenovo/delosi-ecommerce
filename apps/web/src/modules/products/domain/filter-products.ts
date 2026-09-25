import type { Product } from './product'

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function filterByCategory(products: readonly Product[], categorySlug?: string): Product[] {
  if (!categorySlug) return [...products]
  return products.filter((product) => product.categorySlug === categorySlug)
}

/**
 * Case- and accent-insensitive search. Every whitespace-separated term must appear
 * in the title or the description.
 */
export function searchProducts(products: readonly Product[], text?: string): Product[] {
  const terms = normalizeText(text ?? '')
    .split(/\s+/)
    .filter((term) => term.length > 0)
  if (terms.length === 0) return [...products]

  return products.filter((product) => {
    const haystack = normalizeText(`${product.title} ${product.description}`)
    return terms.every((term) => haystack.includes(term))
  })
}
