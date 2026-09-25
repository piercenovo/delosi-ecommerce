export type ProductId = number

export interface Rating {
  rate: number
  count: number
}

export interface Product {
  id: ProductId
  title: string
  price: number
  description: string
  categorySlug: string
  image: string
  rating: Rating
}

export interface Category {
  slug: string
  name: string
}

/** Parses a route segment into a product id: a positive base-10 integer without padding. */
export function parseProductId(raw: string): ProductId | null {
  if (!/^[1-9]\d*$/.test(raw)) return null

  const id = Number(raw)
  return Number.isSafeInteger(id) ? id : null
}
