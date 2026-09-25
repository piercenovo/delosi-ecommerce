import type { CatalogQuery } from '../domain/catalog-query'
import { filterByCategory, searchProducts } from '../domain/filter-products'
import type { Category, Product } from '../domain/product'
import type { ProductRepository } from '../domain/product-repository'
import { sortProducts } from '../domain/sort-strategies'

export interface Catalog {
  products: Product[]
  categories: Category[]
  activeCategory: Category | null
  /** The query actually applied: unknown categories are dropped. */
  query: CatalogQuery
}

export async function getCatalog(
  repository: ProductRepository,
  query: CatalogQuery,
): Promise<Catalog> {
  const [allProducts, categories] = await Promise.all([
    repository.findAll(),
    repository.findCategories(),
  ])

  const activeCategory = categories.find((category) => category.slug === query.category) ?? null
  const appliedQuery: CatalogQuery = {
    ...(activeCategory && { category: activeCategory.slug }),
    ...(query.q && { q: query.q }),
    ...(query.sort && { sort: query.sort }),
  }

  const products = sortProducts(
    searchProducts(filterByCategory(allProducts, appliedQuery.category), appliedQuery.q),
    appliedQuery.sort,
  )

  return { products, categories, activeCategory, query: appliedQuery }
}
