import type { Category, Product } from '@/modules/products/domain/product'

export function makeProduct(overrides: Partial<Product> & Pick<Product, 'id'>): Product {
  return {
    title: `Product ${overrides.id}`,
    price: 10,
    description: '',
    categorySlug: 'electronics',
    image: `/images/products/${overrides.id}.png`,
    rating: { rate: 4, count: 10 },
    ...overrides,
  }
}

export const categories: Category[] = [
  { slug: 'electronics', name: 'Electrónica' },
  { slug: 'jewelery', name: 'Joyería' },
  { slug: 'mens-clothing', name: 'Ropa de hombre' },
  { slug: 'womens-clothing', name: 'Ropa de mujer' },
]
