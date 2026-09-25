// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { onRequestError } from './instrumentation'
import { errorReporter } from './shared/observability/server/reporters'

vi.mock('./shared/observability/server/reporters', () => ({ errorReporter: { capture: vi.fn() } }))

const request = { path: '/products?q=gold', method: 'GET', headers: {} }
const context = {
  routerKind: 'App Router',
  routePath: '/products',
  routeType: 'render',
  renderSource: 'react-server-components',
  revalidateReason: undefined,
} as const

describe('onRequestError', () => {
  it('reports server errors with the digest, route pattern and method', async () => {
    const error = Object.assign(new Error('Catalog unavailable'), { digest: '42' })

    await onRequestError(error, request, context)

    expect(errorReporter.capture).toHaveBeenCalledExactlyOnceWith(error, {
      source: 'server',
      digest: '42',
      route: '/products',
      routeType: 'render',
      method: 'GET',
    })
  })

  it('leaves the request path (and its query string) out of the report', async () => {
    await onRequestError('boom', request, context)

    const [, reported] = vi.mocked(errorReporter.capture).mock.calls[0] ?? []
    expect(reported).toMatchObject({ digest: undefined })
    expect(JSON.stringify(reported)).not.toContain('q=gold')
  })
})
