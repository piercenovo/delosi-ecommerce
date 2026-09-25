import { Suspense } from 'react'
import { productRepository } from '@/composition-root'
import { getCatalog } from '@/modules/products/application/get-catalog'
import type { CatalogQuery } from '@/modules/products/domain/catalog-query'
import { buildCatalogHref, parseCatalogQuery } from '@/modules/products/catalog-search-params'
import { CatalogHeading } from '@/modules/products/ui/CatalogHeading'
import { ProductGrid } from '@/modules/products/ui/ProductGrid'
import { CatalogSkeleton } from './CatalogSkeleton'

export default async function ProductsPage({ searchParams }: PageProps<'/products'>) {
  const query = parseCatalogQuery(await searchParams)

  // A new key per query shows the skeleton again while the next result streams in.
  return (
    <Suspense key={buildCatalogHref(query)} fallback={<CatalogSkeleton />}>
      <Catalog query={query} />
    </Suspense>
  )
}

async function Catalog({ query }: { query: CatalogQuery }) {
  const catalog = await getCatalog(productRepository, query)

  return (
    <>
      <CatalogHeading category={catalog.activeCategory} count={catalog.products.length} />
      <ProductGrid products={catalog.products} />
    </>
  )
}
