// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readJsonBody } from './json-body'

const MAX = 1024

function post(body: BodyInit, headers: Record<string, string> = {}) {
  return new Request('https://shop.test/api/vitals', {
    method: 'POST',
    body,
    headers,
    duplex: 'half',
  } as RequestInit)
}

describe('readJsonBody', () => {
  it('parses a small JSON body', async () => {
    await expect(readJsonBody(post('{"a":1}'), MAX)).resolves.toEqual({ ok: true, json: { a: 1 } })
  })

  it('answers 400 for a body that is not JSON', async () => {
    await expect(readJsonBody(post('nope'), MAX)).resolves.toEqual({ ok: false, status: 400 })
  })

  it('answers 413 by the declared size, then by the actual size', async () => {
    await expect(readJsonBody(post('{}', { 'content-length': '99999' }), MAX)).resolves.toEqual({
      ok: false,
      status: 413,
    })
    await expect(readJsonBody(post('x'.repeat(MAX + 1)), MAX)).resolves.toEqual({
      ok: false,
      status: 413,
    })
  })

  it('does not throw when the client goes away mid-body (tab closed during a beacon)', async () => {
    const aborted = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"na'))
        controller.error(new Error('aborted'))
      },
    })

    await expect(readJsonBody(post(aborted), MAX)).resolves.toEqual({ ok: false, status: 400 })
  })
})
