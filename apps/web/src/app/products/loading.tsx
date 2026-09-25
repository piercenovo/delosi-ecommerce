import { CatalogSkeleton } from './CatalogSkeleton'

// Instant shell while the page reads its search params and the catalog streams in.
export default function Loading() {
  return <CatalogSkeleton />
}
