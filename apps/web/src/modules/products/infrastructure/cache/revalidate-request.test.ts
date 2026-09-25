// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { handleRevalidateRequest } from './revalidate-request'

const SECRET = 'a-very-long-revalidate-secret'

function revalidateRequest({
  secret = SECRET,
  body = JSON.stringify({ tag: 'products' }),
}: { secret?: string | null; body?: string } = {}): Request {
  const headers = new Headers({ 'content-type': 'application/json' })
  if (secret !== null) headers.set('x-revalidate-secret', secret)
  return new Request('https://shop.test/api/revalidate', { method: 'POST', headers, body })
}

async function send(request: Request, secret: string | undefined) {
  const revalidate = vi.fn()
  const response = await handleRevalidateRequest(request, { secret, revalidate })
  return { status: response.status, body: (await response.json()) as unknown, revalidate }
}

describe('handleRevalidateRequest', () => {
  it('revalidates an allowed tag', async () => {
    const { status, body, revalidate } = await send(revalidateRequest(), SECRET)

    expect(status).toBe(200)
    expect(body).toEqual({ revalidated: 'products' })
    expect(revalidate).toHaveBeenCalledExactlyOnceWith('products')
  })

  it('accepts a tag for a single product', async () => {
    const { status, revalidate } = await send(
      revalidateRequest({ body: JSON.stringify({ tag: 'product:5' }) }),
      SECRET,
    )

    expect(status).toBe(200)
    expect(revalidate).toHaveBeenCalledWith('product:5')
  })

  it('is disabled (503) when no secret is configured', async () => {
    const { status, revalidate } = await send(revalidateRequest(), undefined)

    expect(status).toBe(503)
    expect(revalidate).not.toHaveBeenCalled()
  })

  it.each([
    ['a wrong secret', 'not-the-secret'],
    ['a missing secret', null],
  ])('rejects %s with 401', async (_case, secret) => {
    const { status, revalidate } = await send(revalidateRequest({ secret }), SECRET)

    expect(status).toBe(401)
    expect(revalidate).not.toHaveBeenCalled()
  })

  it.each([
    ['an invalid JSON body', '{not json'],
    ['a body without tag', JSON.stringify({})],
    ['a tag outside the allowlist', JSON.stringify({ tag: 'users' })],
  ])('rejects %s with 400', async (_case, body) => {
    const { status, revalidate } = await send(revalidateRequest({ body }), SECRET)

    expect(status).toBe(400)
    expect(revalidate).not.toHaveBeenCalled()
  })
})
