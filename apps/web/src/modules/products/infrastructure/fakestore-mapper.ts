import type { Category, Product } from '../domain/product'
import type { LocalImages, ProductDto } from './fakestore-schemas'

const CATEGORY_NAMES: Readonly<Record<string, string>> = {
  electronics: 'Electrónica',
  jewelery: 'Joyería',
  "men's clothing": 'Ropa de hombre',
  "women's clothing": 'Ropa de mujer',
}

export function toCategorySlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function toCategory(apiName: string): Category {
  return {
    slug: toCategorySlug(apiName),
    name: CATEGORY_NAMES[apiName] ?? capitalize(apiName),
  }
}

export function toProduct(dto: ProductDto, localImages: LocalImages): Product {
  return {
    id: dto.id,
    title: dto.title.trim(),
    price: dto.price,
    description: dto.description.trim(),
    categorySlug: toCategorySlug(dto.category),
    image: localImages[String(dto.id)] ?? dto.image,
    rating: { rate: dto.rating.rate, count: dto.rating.count },
  }
}
