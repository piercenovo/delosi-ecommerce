// @vitest-environment node
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { mswServer, setupMswServer } from '@/test/msw-server'
import { createFakeStoreClient, UpstreamHttpError } from './fakestore-client'

const BASE_URL = 'https://fakestore.test'
const client = createFakeStoreClient({ baseUrl: BASE_URL, timeoutMs: 50, retryDelayMs: 0 })

setupMswServer()

function countRequests(path: string, respond: (attempt: number) => Response | Promise<Response>) {
  let attempts = 0
  mswServer.use(
    http.get(`${BASE_URL}${path}`, () => {
      attempts += 1
      return respond(attempts)
    }),
  )
  return () => attempts
}

describe('createFakeStoreClient', () => {
  it('returns the parsed JSON body', async () => {
    countRequests('/products', () => HttpResponse.json([{ id: 1 }]))

    await expect(client.getJson('/products')).resolves.toEqual([{ id: 1 }])
  })

  it('returns null when the body is empty (FakeStore answers 200 for unknown ids)', async () => {
    countRequests('/products/999', () => new HttpResponse(null, { status: 200 }))

    await expect(client.getJson('/products/999')).resolves.toBeNull()
  })

  it('does not retry client errors such as a Cloudflare 403', async () => {
    const attempts = countRequests(
      '/products',
      () => new HttpResponse('Forbidden', { status: 403 }),
    )

    const request = client.getJson('/products')

    await expect(request).rejects.toBeInstanceOf(UpstreamHttpError)
    await expect(request).rejects.toMatchObject({ status: 403 })
    expect(attempts()).toBe(1)
  })

  it('retries once after a server error', async () => {
    const attempts = countRequests('/products', (attempt) =>
      attempt === 1 ? new HttpResponse(null, { status: 500 }) : HttpResponse.json([]),
    )

    await expect(client.getJson('/products')).resolves.toEqual([])
    expect(attempts()).toBe(2)
  })

  it('fails with a timeout error after retrying a slow response', async () => {
    const attempts = countRequests('/products', async () => {
      await delay(200)
      return HttpResponse.json([])
    })

    await expect(client.getJson('/products')).rejects.toMatchObject({ name: 'TimeoutError' })
    expect(attempts()).toBe(2)
  })

  it('does not retry an invalid JSON body', async () => {
    const attempts = countRequests(
      '/products',
      () => new HttpResponse('<html>challenge</html>', { status: 200 }),
    )

    await expect(client.getJson('/products')).rejects.toBeInstanceOf(SyntaxError)
    expect(attempts()).toBe(1)
  })
})
