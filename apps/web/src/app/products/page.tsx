import type { Metadata } from 'next'
import { Suspense } from 'react'
import { productRepository } from '@/composition-root'
import { QuickAddButton } from '@/modules/cart/ui/QuickAddButton'
import { getCatalog } from '@/modules/products/application/get-catalog'
import {
  parseCatalogQuery,
  type RawSearchParams,
} from '@/modules/products/url/catalog-search-params'
import { buildCatalogMetadata } from '@/modules/products/seo/catalog-metadata'
import { CatalogControls } from '@/modules/products/ui/CatalogControls'
import { CatalogEmptyState } from '@/modules/products/ui/CatalogEmptyState'
import { CatalogHeading } from '@/modules/products/ui/CatalogHeading'
import { CatalogNavigationProvider } from '@/modules/products/ui/catalog-navigation'
import { CatalogResultsRegion } from '@/modules/products/ui/CatalogResultsRegion'
import { CategoryNav } from '@/modules/products/ui/CategoryNav'
import { ProductGrid } from '@/modules/products/ui/ProductGrid'
import { CatalogSkeleton } from './CatalogSkeleton'
import styles from './page.module.css'
import { toCartProduct } from './to-cart-product'

export async function generateMetadata({
  searchParams,
}: PageProps<'/products'>): Promise<Metadata> {
  const query = parseCatalogQuery(await searchParams)
  return buildCatalogMetadata(query, await productRepository.findCategories())
}

// The Suspense boundary has no key on purpose: on a filter change the transition keeps the
// current results (dimmed) until the next ones arrive, and the search box keeps its focus.
export default function ProductsPage({ searchParams }: PageProps<'/products'>) {
  return (
    <CatalogNavigationProvider>
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </CatalogNavigationProvider>
  )
}

async function Catalog({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const { products, categories, activeCategory, query } = await getCatalog(
    productRepository,
    parseCatalogQuery(await searchParams),
  )

  return (
    <>
      <CatalogHeading category={activeCategory} count={products.length} search={query.q} />
      <div className={styles.toolbar}>
        <CategoryNav categories={categories} query={query} />
        <CatalogControls query={query} />
      </div>
      <CatalogResultsRegion>
        {products.length > 0 ? (
          <ProductGrid
            products={products}
            renderAction={(product) => <QuickAddButton product={toCartProduct(product)} />}
          />
        ) : (
          <CatalogEmptyState query={query} category={activeCategory} />
        )}
      </CatalogResultsRegion>
    </>
  )
}
