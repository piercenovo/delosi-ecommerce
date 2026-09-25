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
