import { CatalogHeadingSkeleton } from '@/modules/products/ui/CatalogHeading'
import { ProductGridSkeleton } from '@/modules/products/ui/ProductGridSkeleton'

export function CatalogSkeleton() {
  return (
    <>
      <CatalogHeadingSkeleton />
      <ProductGridSkeleton />
    </>
  )
}
