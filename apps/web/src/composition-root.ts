import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import type { ProductId } from '@/modules/products/domain/product'
import type { ProductRepository } from '@/modules/products/domain/product-repository'
import { CATALOG_CACHE_TAGS } from '@/modules/products/infrastructure/cache/cache-tags'
import { FallbackProductRepository } from '@/modules/products/infrastructure/fallback-product-repository'
import { createFakeStoreClient } from '@/modules/products/infrastructure/fakestore/fakestore-client'
import { FakeStoreProductRepository } from '@/modules/products/infrastructure/fakestore/fakestore-product-repository'
import { fakeStoreSnapshotSchema } from '@/modules/products/infrastructure/fakestore/fakestore-schemas'
import snapshotJson from '@/modules/products/infrastructure/snapshot/fakestore-snapshot.json'
import { SnapshotProductRepository } from '@/modules/products/infrastructure/snapshot/snapshot-product-repository'
import { serverEnv } from '@/shared/config/server-env'

const snapshot = fakeStoreSnapshotSchema.parse(snapshotJson)

// Local copies replace FakeStore's image URLs unless PRODUCT_IMAGES=remote. With no entry,
// the mapper keeps the API's URL, which next/image optimizes (see product-images.ts).
const localImages = serverEnv.PRODUCT_IMAGES === 'local' ? snapshot.images : {}

function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error)
  return error.cause instanceof Error ? `${error.message}: ${error.cause.message}` : error.message
}

const liveProductRepository: ProductRepository = new FakeStoreProductRepository(
  createFakeStoreClient({ baseUrl: serverEnv.PRODUCTS_API_BASE_URL }),
  localImages,
)

/**
 * Live FakeStore first; the versioned snapshot when it is unreachable
 * (Cloudflare blocks datacenter IPs such as CI runners and Vercel).
 * CATALOG_SNAPSHOT_FALLBACK=off exposes API failures, to test error.tsx.
 */
const sourceProductRepository: ProductRepository =
  serverEnv.CATALOG_SNAPSHOT_FALLBACK === 'off'
    ? liveProductRepository
    : new FallbackProductRepository(
        liveProductRepository,
        new SnapshotProductRepository({ ...snapshot, images: localImages }),
        (error, operation) => {
          console.warn(
            JSON.stringify({
              level: 'warn',
              event: 'catalog.fallback_to_snapshot',
              operation,
              reason: describeError(error),
            }),
          )
        },
      )

// Next.js cache layer. `'use cache'` functions must live at module level: values captured
// from a closure become part of the cache key and must be serializable (a class instance
// is not). Filtering, search and sort run per request on top of these cached reads.
async function findAllCached() {
  'use cache'
  cacheLife('hours')
  cacheTag(CATALOG_CACHE_TAGS.products)
  return sourceProductRepository.findAll()
}

async function findByIdCached(id: ProductId) {
  'use cache'
  cacheLife('hours')
  cacheTag(CATALOG_CACHE_TAGS.products, CATALOG_CACHE_TAGS.product(id))
  return sourceProductRepository.findById(id)
}

async function findCategoriesCached() {
  'use cache'
  cacheLife('days')
  cacheTag(CATALOG_CACHE_TAGS.categories)
  return sourceProductRepository.findCategories()
}

export const productRepository: ProductRepository = {
  findAll: findAllCached,
  findById: findByIdCached,
  findCategories: findCategoriesCached,
}
