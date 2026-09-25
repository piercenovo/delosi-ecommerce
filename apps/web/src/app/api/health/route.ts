import { connection, NextResponse } from 'next/server'
import { serverEnv } from '@/shared/config/server-env'

const UPSTREAM_TIMEOUT_MS = 5000

export async function GET() {
  await connection()
  const startedAt = Date.now()

  try {
    const response = await fetch(`${serverEnv.PRODUCTS_API_BASE_URL}/products/categories`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })

    return NextResponse.json(
      {
        status: response.ok ? 'ok' : 'degraded',
        upstreamStatus: response.status,
        latencyMs: Date.now() - startedAt,
      },
      { status: response.ok ? 200 : 503 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'down',
        error: error instanceof Error ? error.name : 'UnknownError',
        latencyMs: Date.now() - startedAt,
      },
      { status: 503 },
    )
  }
}
