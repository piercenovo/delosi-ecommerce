import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createClientErrorReporter, MAX_MESSAGE_LENGTH, MAX_STACK_LENGTH } from './client-reporters'

async function beaconed(call: unknown[] | undefined) {
  const [url, blob] = call ?? []
  return { url, body: JSON.parse(await (blob as Blob).text()) as Record<string, unknown> }
}

describe('createClientErrorReporter', () => {
  const sendBeacon = vi.fn().mockReturnValue(true)
  const local = { capture: vi.fn() }

  beforeEach(() => {
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true })
    window.history.replaceState(null, '', '/products?q=secret')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps the local (browser console) report', () => {
    const error = new Error('boom')

    createClientErrorReporter('/api/errors', local).capture(error, { source: 'client' })

    expect(local.capture).toHaveBeenCalledExactlyOnceWith(error, { source: 'client' })
  })

  it('forwards the error to the server with its digest and the path only', async () => {
    const error = Object.assign(new TypeError('Cannot read x'), { digest: '42' })

    createClientErrorReporter('/api/errors', local).capture(error, {
      source: 'client',
      digest: '42',
    })

    const { url, body } = await beaconed(sendBeacon.mock.calls[0])
    expect(url).toBe('/api/errors')
    expect(body).toMatchObject({
      name: 'TypeError',
      message: 'Cannot read x',
      digest: '42',
      route: '/products',
    })
    expect(body.stack).toEqual(expect.stringContaining('Cannot read x'))
  })

  it('truncates long messages and stacks to keep the beacon small', async () => {
    const error = new Error('m'.repeat(5000))
    error.stack = 's'.repeat(10_000)

    createClientErrorReporter('/api/errors', local).capture(error, { source: 'client' })

    const { body } = await beaconed(sendBeacon.mock.calls[0])
    expect(body.message).toHaveLength(MAX_MESSAGE_LENGTH)
    expect(body.stack).toHaveLength(MAX_STACK_LENGTH)
    expect(body).not.toHaveProperty('digest')
  })

  it('reports thrown values that are not errors', async () => {
    createClientErrorReporter('/api/errors', local).capture('boom', { source: 'client' })

    const { body } = await beaconed(sendBeacon.mock.calls[0])
    expect(body).toMatchObject({ name: 'NonError', message: 'boom' })
    expect(body).not.toHaveProperty('stack')
  })

  it('falls back to a keepalive fetch when the beacon is refused', () => {
    sendBeacon.mockReturnValueOnce(false)
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    createClientErrorReporter('/api/errors', local).capture(new Error('x'), { source: 'client' })

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      '/api/errors',
      expect.objectContaining({ method: 'POST', keepalive: true }),
    )
  })
})
