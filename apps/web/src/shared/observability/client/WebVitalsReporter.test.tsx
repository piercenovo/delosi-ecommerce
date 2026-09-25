import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WebVitalsReporter } from './WebVitalsReporter'

const hook = vi.hoisted(() => ({ callback: undefined as ((metric: object) => void) | undefined }))

vi.mock('next/web-vitals', () => ({
  useReportWebVitals: (callback: (metric: object) => void) => {
    hook.callback = callback
  },
}))

const metric = {
  name: 'LCP',
  value: 1500,
  rating: 'good',
  id: 'v5-lcp',
  navigationType: 'navigate',
  delta: 1500,
  entries: [],
}

async function sentBody(blob: unknown) {
  return JSON.parse(await (blob as Blob).text()) as Record<string, unknown>
}

describe('WebVitalsReporter', () => {
  const sendBeacon = vi.fn()
  const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))

  beforeEach(() => {
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true })
    vi.stubGlobal('fetch', fetchMock)
    window.history.replaceState(null, '', '/products?q=secret')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('beacons each metric with the path only, never the query string', async () => {
    sendBeacon.mockReturnValue(true)
    render(<WebVitalsReporter />)

    hook.callback?.(metric)

    expect(sendBeacon).toHaveBeenCalledOnce()
    const [url, blob] = sendBeacon.mock.calls[0] ?? []
    expect(url).toBe('/api/vitals')
    expect(await sentBody(blob)).toEqual({
      name: 'LCP',
      value: 1500,
      rating: 'good',
      id: 'v5-lcp',
      navigationType: 'navigate',
      route: '/products',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('falls back to a keepalive fetch when the beacon is refused', () => {
    sendBeacon.mockReturnValue(false)
    render(<WebVitalsReporter />)

    hook.callback?.(metric)

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      '/api/vitals',
      expect.objectContaining({ method: 'POST', keepalive: true }),
    )
  })

  it('skips metrics the app does not track, such as the deprecated FID', () => {
    sendBeacon.mockReturnValue(true)
    render(<WebVitalsReporter />)

    hook.callback?.({ ...metric, name: 'FID' })

    expect(sendBeacon).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('renders nothing', () => {
    const { container } = render(<WebVitalsReporter />)

    expect(container).toBeEmptyDOMElement()
  })
})
