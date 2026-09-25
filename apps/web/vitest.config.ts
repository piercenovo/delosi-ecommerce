import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const DOMAIN_THRESHOLD = 95
const GLOBAL_THRESHOLD = 80

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // Routes and wiring are covered by the E2E suite (ADR 0002).
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/app/**',
        'src/composition-root.ts',
        'src/shared/config/server-env.ts',
      ],
      reporter: ['text-summary', 'html', 'lcov'],
      thresholds: {
        lines: GLOBAL_THRESHOLD,
        functions: GLOBAL_THRESHOLD,
        branches: GLOBAL_THRESHOLD,
        statements: GLOBAL_THRESHOLD,
        'src/modules/**/domain/**': {
          lines: DOMAIN_THRESHOLD,
          functions: DOMAIN_THRESHOLD,
          branches: DOMAIN_THRESHOLD,
          statements: DOMAIN_THRESHOLD,
        },
      },
    },
  },
})
