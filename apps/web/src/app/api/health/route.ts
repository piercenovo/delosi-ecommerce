import { connection, NextResponse } from 'next/server'
import { serverEnv } from '@/shared/config/server-env'

const UPSTREAM_TIMEOUT_MS = 5000

/**
 * Reports whether the catalog is served from the live FakeStore API or from the
 * versioned snapshot. Always 200: the storefront keeps working in both cases.
 */
export async function GET() {
  await connection()
  const startedAt = Date.now()

  try {
    const response = await fetch(`${serverEnv.PRODUCTS_API_BASE_URL}/products/categories`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })

    return NextResponse.json({
      status: response.ok ? 'ok' : 'degraded',
      servedFrom: response.ok ? 'live' : 'snapshot',
      upstreamStatus: response.status,
      latencyMs: Date.now() - startedAt,
    })
  } catch (error) {
    return NextResponse.json({
      status: 'degraded',
      servedFrom: 'snapshot',
      error: error instanceof Error ? error.name : 'UnknownError',
      latencyMs: Date.now() - startedAt,
    })
  }
}
