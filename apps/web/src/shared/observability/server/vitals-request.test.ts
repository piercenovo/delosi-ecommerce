// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { handleVitalsRequest } from './vitals-request'

const valid = { name: 'INP', value: 88, rating: 'good', id: 'v5-1', route: '/products/5' }

function post(body: unknown) {
  return new Request('https://shop.test/api/vitals', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('handleVitalsRequest', () => {
  it('reports a valid metric and answers 204', async () => {
    const reporter = { report: vi.fn() }

    const response = await handleVitalsRequest(
      post({ ...valid, navigationType: 'navigate' }),
      reporter,
    )

    expect(response.status).toBe(204)
    expect(reporter.report).toHaveBeenCalledExactlyOnceWith({
      ...valid,
      navigationType: 'navigate',
    })
  })

  it.each([
    ['an unknown metric', { ...valid, name: 'FID' }],
    ['a negative value', { ...valid, value: -1 }],
    ['an unknown rating', { ...valid, rating: 'great' }],
    ['a route with a query string', { ...valid, route: '/products?q=secret' }],
    ['a relative route', { ...valid, route: 'products' }],
    ['a missing id', { ...valid, id: undefined }],
  ])('rejects %s with 400', async (_, body) => {
    const reporter = { report: vi.fn() }

    const response = await handleVitalsRequest(post(body), reporter)

    expect(response.status).toBe(400)
    expect(reporter.report).not.toHaveBeenCalled()
  })

  it('rejects a body that is not JSON', async () => {
    const response = await handleVitalsRequest(post('not json'), { report: vi.fn() })

    expect(response.status).toBe(400)
  })

  it('rejects oversized bodies without parsing them', async () => {
    const reporter = { report: vi.fn() }

    const response = await handleVitalsRequest(post({ ...valid, id: 'x'.repeat(5000) }), reporter)

    expect(response.status).toBe(413)
    expect(reporter.report).not.toHaveBeenCalled()
  })

  it('rejects by the declared size before reading the body', async () => {
    const request = new Request('https://shop.test/api/vitals', {
      method: 'POST',
      headers: { 'content-length': '999999' },
      body: JSON.stringify(valid),
    })

    expect((await handleVitalsRequest(request, { report: vi.fn() })).status).toBe(413)
  })
})
