import type { BreadcrumbItem } from '@/shared/ui/Breadcrumbs'
import type { Category, Product } from '../domain/product'
import { buildCatalogHref } from '../url/catalog-search-params'

/** Catalog → category → product. The last item is the current page, so it has no link. */
export function buildProductBreadcrumbs(
  product: Product,
  category: Category | null,
): BreadcrumbItem[] {
  return [
    { label: 'Catálogo', href: '/products' },
    ...(category
      ? [{ label: category.name, href: buildCatalogHref({ category: category.slug }) }]
      : []),
    { label: product.title },
  ]
}
