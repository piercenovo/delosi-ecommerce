import 'server-only'
import type { ProductRepository } from '@/modules/products/domain/product-repository'
import { FallbackProductRepository } from '@/modules/products/infrastructure/fallback-product-repository'
import { createFakeStoreClient } from '@/modules/products/infrastructure/fakestore-client'
import { FakeStoreProductRepository } from '@/modules/products/infrastructure/fakestore-product-repository'
import { fakeStoreSnapshotSchema } from '@/modules/products/infrastructure/fakestore-schemas'
import snapshotJson from '@/modules/products/infrastructure/snapshot/fakestore-snapshot.json'
import { SnapshotProductRepository } from '@/modules/products/infrastructure/snapshot-product-repository'
import { serverEnv } from '@/shared/config/server-env'

const snapshot = fakeStoreSnapshotSchema.parse(snapshotJson)

function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error)
  return error.cause instanceof Error ? `${error.message}: ${error.cause.message}` : error.message
}

/**
 * Live FakeStore first; the versioned snapshot when it is unreachable
 * (Cloudflare blocks datacenter IPs such as CI runners and Vercel).
 */
export const productRepository: ProductRepository = new FallbackProductRepository(
  new FakeStoreProductRepository(
    createFakeStoreClient({ baseUrl: serverEnv.PRODUCTS_API_BASE_URL }),
    snapshot.images,
  ),
  new SnapshotProductRepository(snapshot),
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
