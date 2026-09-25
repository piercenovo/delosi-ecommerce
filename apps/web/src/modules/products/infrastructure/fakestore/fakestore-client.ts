export class UpstreamHttpError extends Error {
  override readonly name = 'UpstreamHttpError'
  readonly status: number

  constructor(status: number, url: string) {
    super(`GET ${url} responded with status ${status}`)
    this.status = status
  }
}

export interface FakeStoreClient {
  /** Resolves to the parsed JSON body, or `null` when the body is empty. */
  getJson(path: string): Promise<unknown>
}

interface FakeStoreClientOptions {
  baseUrl: string
  timeoutMs?: number
  retryDelayMs?: number
}

/** Network failures, timeouts and 5xx responses are transient; 4xx and invalid JSON are not. */
function isTransient(error: unknown): boolean {
  if (error instanceof UpstreamHttpError) return error.status >= 500
  if (error instanceof TypeError) return true
  return error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function createFakeStoreClient({
  baseUrl,
  timeoutMs = 5000,
  retryDelayMs = 300,
}: FakeStoreClientOptions): FakeStoreClient {
  async function request(url: string): Promise<unknown> {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok) {
      throw new UpstreamHttpError(response.status, url)
    }

    const body = await response.text()
    return body.trim() === '' ? null : (JSON.parse(body) as unknown)
  }

  return {
    async getJson(path) {
      const url = `${baseUrl}${path}`
      try {
        return await request(url)
      } catch (error) {
        if (!isTransient(error)) throw error
        await wait(retryDelayMs)
        return request(url)
      }
    },
  }
}
