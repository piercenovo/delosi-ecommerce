import { ProductDetailSkeleton } from '@/modules/products/ui/ProductDetailSkeleton'

// Shown instantly while a product that was not prerendered renders on demand.
export default function Loading() {
  return <ProductDetailSkeleton />
}
