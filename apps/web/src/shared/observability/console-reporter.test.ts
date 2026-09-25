import { describe, expect, it, vi } from 'vitest'
import { createConsoleReporter } from './console-reporter'

const NOW = new Date('2026-09-25T12:00:00.000Z')

function setup() {
  const sink = { error: vi.fn(), info: vi.fn() }
  const reporter = createConsoleReporter({ sink, now: () => NOW })
  const lastLine = (method: 'error' | 'info') =>
    JSON.parse(String(sink[method].mock.lastCall?.[0])) as Record<string, unknown>
  return { sink, reporter, lastLine }
}

describe('createConsoleReporter', () => {
  it('writes errors as one structured JSON line', () => {
    const { reporter, lastLine } = setup()
    const error = Object.assign(new Error('Catalog unavailable'), {
      name: 'CatalogUnavailableError',
    })

    reporter.capture(error, { source: 'server', digest: 'abc123', route: '/products' })

    expect(lastLine('error')).toMatchObject({
      level: 'error',
      event: 'error',
      name: 'CatalogUnavailableError',
      message: 'Catalog unavailable',
      source: 'server',
      digest: 'abc123',
      route: '/products',
      timestamp: '2026-09-25T12:00:00.000Z',
    })
    expect(lastLine('error').stack).toEqual(expect.stringContaining('Catalog unavailable'))
  })

  it('reports values that are not Error instances', () => {
    const { reporter, lastLine } = setup()

    reporter.capture('boom', { source: 'client' })

    expect(lastLine('error')).toMatchObject({ name: 'NonError', message: 'boom', source: 'client' })
  })

  it('writes web vitals as info lines', () => {
    const { reporter, lastLine } = setup()

    reporter.report({ name: 'LCP', value: 1234.5, rating: 'good', id: 'v1', route: '/products' })

    expect(lastLine('info')).toEqual({
      level: 'info',
      event: 'web_vital',
      name: 'LCP',
      value: 1234.5,
      rating: 'good',
      id: 'v1',
      route: '/products',
      timestamp: '2026-09-25T12:00:00.000Z',
    })
  })
})
