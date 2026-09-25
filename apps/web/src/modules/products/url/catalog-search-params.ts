/**
 * Reads and writes the catalog state kept in the URL (`/products?category=&q=&sort=`).
 * Shared by server and client code: no Next.js dependencies.
 */
import { z } from 'zod'
import { SORT_KEYS, type CatalogQuery } from '../domain/catalog-query'

const MAX_SEARCH_LENGTH = 100
const CATALOG_PATH = '/products'
const PARAM_ORDER = ['category', 'q', 'sort'] as const

// Each field falls back to `undefined` on its own: a broken URL never breaks the page.
const catalogQuerySchema = z.object({
  category: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{1,50}$/)
    .optional()
    .catch(undefined),
  q: z
    .string()
    .transform((value) => value.trim().slice(0, MAX_SEARCH_LENGTH).trim())
    .pipe(z.string().min(1))
    .optional()
    .catch(undefined),
  sort: z.enum(SORT_KEYS).optional().catch(undefined),
})

export type RawSearchParams = Record<string, string | string[] | undefined>

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function withoutEmptyFields(query: CatalogQuery): CatalogQuery {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
  )
}

export function parseCatalogQuery(searchParams: RawSearchParams): CatalogQuery {
  const query = catalogQuerySchema.parse({
    category: firstValue(searchParams.category),
    q: firstValue(searchParams.q),
    sort: firstValue(searchParams.sort),
  })
  return withoutEmptyFields(query)
}

/** Builds a catalog URL; an `undefined` override removes that param. */
export function buildCatalogHref(
  query: CatalogQuery,
  overrides: Partial<CatalogQuery> = {},
): string {
  const merged: CatalogQuery = { ...query, ...overrides }
  const params = new URLSearchParams()
  for (const key of PARAM_ORDER) {
    const value = merged[key]
    if (value) params.set(key, value)
  }

  const search = params.toString()
  return search ? `${CATALOG_PATH}?${search}` : CATALOG_PATH
}
