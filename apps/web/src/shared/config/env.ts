import { z } from 'zod'

const urlWithoutTrailingSlash = z.url().transform((value) => value.replace(/\/+$/, ''))

const serverEnvSchema = z.object({
  PRODUCTS_API_BASE_URL: urlWithoutTrailingSlash.default('https://fakestoreapi.com'),
  NEXT_PUBLIC_SITE_URL: urlWithoutTrailingSlash.default('http://localhost:3000'),
  REVALIDATE_SECRET: z.string().min(16).optional(),
  // `off` only to test error handling (E2E): a failing API then reaches error.tsx.
  CATALOG_SNAPSHOT_FALLBACK: z.enum(['on', 'off']).default('on'),
  // `remote`: product photos load from FakeStore through next/image (production).
  // `local`: from the copies in public/images/products (default: dev, CI, E2E, Lighthouse,
  // which run offline against the mock). Read at build time: prerendered pages keep it.
  PRODUCT_IMAGES: z.enum(['remote', 'local']).default('local'),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source)

  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`)
  }

  return result.data
}
