// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { handleClientErrorRequest } from './client-error-request'

const valid = {
  name: 'TypeError',
  message: 'Cannot read properties of undefined',
  stack: 'TypeError: Cannot read properties of undefined\n    at Cart',
  digest: '2119846366',
  route: '/products/5',
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://shop.test/api/errors', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('handleClientErrorRequest', () => {
  it('logs a valid report with the server ErrorReporter and answers 204', async () => {
    const reporter = { capture: vi.fn() }

    const response = await handleClientErrorRequest(post(valid), reporter)

    expect(response.status).toBe(204)
    const [error, context] = reporter.capture.mock.calls[0] ?? []
    expect(error).toBeInstanceOf(Error)
    expect(error).toMatchObject({ name: 'TypeError', message: valid.message, stack: valid.stack })
    expect(context).toEqual({ source: 'client', digest: '2119846366', route: '/products/5' })
  })

  it.each([
    ['a route with a query string', { ...valid, route: '/products?q=secret' }],
    ['a missing name', { ...valid, name: '' }],
    ['an oversized message', { ...valid, message: 'x'.repeat(501) }],
  ])('rejects %s with 400', async (_, body) => {
    const reporter = { capture: vi.fn() }

    expect((await handleClientErrorRequest(post(body), reporter)).status).toBe(400)
    expect(reporter.capture).not.toHaveBeenCalled()
  })

  it('rejects a body that is not JSON', async () => {
    expect((await handleClientErrorRequest(post('nope'), { capture: vi.fn() })).status).toBe(400)
  })

  it('rejects oversized bodies (declared or actual) with 413', async () => {
    const reporter = { capture: vi.fn() }

    const declared = await handleClientErrorRequest(
      post(valid, { 'content-length': '99999' }),
      reporter,
    )
    const actual = await handleClientErrorRequest(
      post({ ...valid, stack: 's'.repeat(5000) }),
      reporter,
    )

    expect([declared.status, actual.status]).toEqual([413, 413])
    expect(reporter.capture).not.toHaveBeenCalled()
  })
})
