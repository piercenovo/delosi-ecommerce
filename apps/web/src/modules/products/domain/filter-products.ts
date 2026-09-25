import type { Product } from './product'

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function filterByCategory(products: readonly Product[], categorySlug?: string): Product[] {
  if (!categorySlug) return [...products]
  return products.filter((product) => product.categorySlug === categorySlug)
}

function toWords(value: string): string[] {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 0)
}

/**
 * Case- and accent-insensitive search. Every term must match the start of a word in the
 * title or the description, so "mens" finds "Mens Jacket" but not "Womens Shirt", and
 * partial words still work ("cott" finds "Cotton").
 */
export function searchProducts(products: readonly Product[], text?: string): Product[] {
  const terms = toWords(text ?? '')
  if (terms.length === 0) return [...products]

  return products.filter((product) => {
    const words = toWords(`${product.title} ${product.description}`)
    return terms.every((term) => words.some((word) => word.startsWith(term)))
  })
}
