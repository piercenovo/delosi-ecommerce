import type { Metadata } from 'next'
import { buildCatalogHref } from '../catalog-search-params'
import type { CatalogQuery } from '../domain/catalog-query'
import type { Category } from '../domain/product'

const CATALOG_DESCRIPTION =
  'Explora el catálogo de Delosi Store: electrónica, joyería y ropa, con filtros y búsqueda.'

/**
 * One indexable URL per category. Sort and search only reorder or narrow the same content,
 * so they never reach the canonical URL, and search results are kept out of the index.
 */
export function buildCatalogMetadata(
  query: CatalogQuery,
  categories: readonly Category[],
): Metadata {
  const category = categories.find(({ slug }) => slug === query.category)
  const title = category?.name ?? 'Catálogo'
  const description = category
    ? `${category.name} en Delosi Store: compara precios y valoraciones de cada producto.`
    : CATALOG_DESCRIPTION
  const canonical = buildCatalogHref(category ? { category: category.slug } : {})

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    ...(query.q ? { robots: { index: false, follow: true } } : {}),
  }
}
