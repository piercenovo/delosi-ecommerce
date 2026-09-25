import { Badge } from '@delosi/ui'
import { Suspense } from 'react'
import { productRepository } from '@/composition-root'
import { getCatalog } from '@/modules/products/application/get-catalog'
import { parseCatalogQuery, type RawSearchParams } from '@/modules/products/catalog-search-params'

// Provisional catalog view: the final UI (filters, grid, skeletons) arrives in Plan 4.
export default function ProductsPage({ searchParams }: PageProps<'/products'>) {
  return (
    <main>
      <h1>Catálogo</h1>
      <Suspense fallback={<p>Cargando productos…</p>}>
        <ProductList searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function ProductList({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const catalog = await getCatalog(productRepository, parseCatalogQuery(await searchParams))

  return (
    <section aria-label="Productos">
      <p>
        {catalog.activeCategory ? `${catalog.activeCategory.name} ` : ''}
        <Badge tone="primary">{catalog.products.length} productos</Badge>
      </p>
      <ul>
        {catalog.products.map((product) => (
          <li key={product.id}>
            {product.title} · ${product.price}
          </li>
        ))}
      </ul>
    </section>
  )
}
