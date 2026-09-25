import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

const THRESHOLD = 80

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.stories.tsx', 'src/test/**', 'src/**/index.ts'],
      reporter: ['text-summary', 'html', 'lcov'],
      thresholds: {
        lines: THRESHOLD,
        functions: THRESHOLD,
        branches: THRESHOLD,
        statements: THRESHOLD,
      },
    },
  },
})
