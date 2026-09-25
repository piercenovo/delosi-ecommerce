import { vi } from 'vitest'

/** App Router stub for client components: assert on `push` and `replace` calls. */
export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
}
