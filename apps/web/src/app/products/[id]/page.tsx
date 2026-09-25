import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { productRepository } from '@/composition-root'
import { getProductDetail } from '@/modules/products/application/get-product-detail'
import { getRelatedProducts } from '@/modules/products/application/get-related-products'
import { ProductNotFoundError } from '@/modules/products/domain/errors'
import { parseProductId, type Product } from '@/modules/products/domain/product'
import { buildProductBreadcrumbs } from '@/modules/products/seo/product-breadcrumbs'
import { buildBreadcrumbJsonLd, buildProductJsonLd } from '@/modules/products/seo/product-json-ld'
import { buildProductMetadata } from '@/modules/products/seo/product-metadata'
import { AddToCartButton } from '@/modules/cart/ui/add-to-cart/AddToCartButton'
import { QuickAddButton } from '@/modules/cart/ui/add-to-cart/QuickAddButton'
import { ProductDetail } from '@/modules/products/ui/detail/ProductDetail'
import { RelatedProducts } from '@/modules/products/ui/detail/RelatedProducts'
import { serverEnv } from '@/shared/config/server-env'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { JsonLd } from '@/shared/ui/JsonLd'
import { toCartProduct } from '../to-cart-product'

// Blocking on purpose (ADR 0011): ids outside generateStaticParams render on demand with no
// Suspense, so an unknown id gets a real 404 status and crawlers get the complete HTML.
// This opts the page out of Next's dev-only "instant navigation" validation.
export const instant = false

// Every known product is prerendered at build time; ids added later render on demand.
export async function generateStaticParams() {
  const products = await productRepository.findAll()
  return products.map(({ id }) => ({ id: String(id) }))
}

/** Invalid or unknown ids are a 404. Reads are cached, so metadata and page share them. */
async function loadProduct(rawId: string): Promise<Product> {
  const id = parseProductId(rawId)
  if (id === null) notFound()

  try {
    return await getProductDetail(productRepository, id)
  } catch (error) {
    if (error instanceof ProductNotFoundError) notFound()
    throw error
  }
}

export async function generateMetadata({ params }: PageProps<'/products/[id]'>): Promise<Metadata> {
  return buildProductMetadata(await loadProduct((await params).id))
}

export default async function ProductPage({ params }: PageProps<'/products/[id]'>) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    loadProduct(id),
    productRepository.findCategories(),
  ])
  const category = categories.find(({ slug }) => slug === product.categorySlug) ?? null
  const trail = buildProductBreadcrumbs(product, category)
  // Same cached catalog read as the rest of the page: no separate Suspense boundary, so the
  // prerendered page ships complete (a fallback would only flash and shift the footer).
  const related = await getRelatedProducts(productRepository, product)

  return (
    <>
      <JsonLd data={buildProductJsonLd(product, category, serverEnv.NEXT_PUBLIC_SITE_URL)} />
      <JsonLd data={buildBreadcrumbJsonLd(trail, serverEnv.NEXT_PUBLIC_SITE_URL)} />
      <Breadcrumbs items={trail} />
      <ProductDetail
        product={product}
        actions={<AddToCartButton product={toCartProduct(product)} />}
      />
      <RelatedProducts
        products={related}
        renderAction={(item) => <QuickAddButton product={toCartProduct(item)} />}
      />
    </>
  )
}
