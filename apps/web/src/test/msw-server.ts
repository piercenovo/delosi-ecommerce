import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

export const mswServer = setupServer()

/** Registers the MSW lifecycle hooks; unhandled requests fail the test. */
export function setupMswServer(): void {
  beforeAll(() => mswServer.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => mswServer.resetHandlers())
  afterAll(() => mswServer.close())
}
