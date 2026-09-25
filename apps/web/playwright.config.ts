import { defineConfig, devices } from '@playwright/test'

/**
 * E2E against the production build (`next build` first), with FakeStore replaced by a local
 * mock: deterministic data, no network. Two app instances run side by side, so error
 * scenarios never toggle shared state and every test can run in parallel:
 *   APP_URL       healthy mock
 *   DOWN_APP_URL  mock that answers 500 to everything
 * The snapshot fallback is off in both, so API failures reach the error pages.
 */
const PORTS = { app: 3200, downApp: 3201, mock: 4010, downMock: 4011 }

export const APP_URL = `http://localhost:${PORTS.app}`
export const DOWN_APP_URL = `http://localhost:${PORTS.downApp}`

const isCI = Boolean(process.env.CI)

function mockServer(port: number, mode: 'healthy' | 'down') {
  return {
    command: 'node e2e/mock-server.ts',
    url: `http://localhost:${port}/__health`,
    env: { MOCK_PORT: String(port), ...(mode === 'down' ? { MOCK_MODE: 'down' } : {}) },
    reuseExistingServer: !isCI,
  }
}

function appServer(port: number, mockPort: number, { quiet = false } = {}) {
  return {
    // Node directly, not `pnpm exec`: pnpm does not forward the stop signal to `next`, and
    // Playwright would wait on the orphaned server at teardown.
    command: `node node_modules/next/dist/bin/next start -p ${port}`,
    // Always 200 (reports degraded when the API is down), so it works for both instances.
    url: `http://localhost:${port}/api/health`,
    env: {
      PRODUCTS_API_BASE_URL: `http://localhost:${mockPort}`,
      CATALOG_SNAPSHOT_FALLBACK: 'off',
    },
    reuseExistingServer: !isCI,
    timeout: 60_000,
    // The API-down instance logs errors on purpose; keep them out of the test output.
    ...(quiet ? { stderr: 'ignore' as const } : {}),
  }
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: APP_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // A phone viewport and touch, on Chromium (no extra browser to install).
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    // Safari's engine: e.g. `list-style: none` drops list semantics there.
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    mockServer(PORTS.mock, 'healthy'),
    mockServer(PORTS.downMock, 'down'),
    appServer(PORTS.app, PORTS.mock),
    appServer(PORTS.downApp, PORTS.downMock, { quiet: true }),
  ],
})
