import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import delosiBase from '@delosi/config/eslint/base'

const MODULES = './src/modules/*'
const layer = (name) => `${MODULES}/${name}/**`

// Layer rules from AGENTS.md (ADR 0002). Verified by src/test/architecture.test.ts.
const architectureRules = {
  files: ['src/**/*.{ts,tsx}'],
  rules: {
    'import/no-restricted-paths': [
      'error',
      {
        basePath: import.meta.dirname,
        zones: [
          {
            target: layer('domain'),
            from: [layer('application'), layer('infrastructure'), layer('store'), layer('ui')],
            message: 'domain/ is pure: it must not depend on other layers.',
          },
          {
            target: layer('application'),
            from: [layer('infrastructure'), layer('store'), layer('ui')],
            message: 'application/ depends only on domain/ (receive adapters as parameters).',
          },
          {
            target: layer('ui'),
            from: [layer('infrastructure')],
            message: 'ui/ must not use infrastructure/ directly; pages inject what it needs.',
          },
          {
            target: layer('store'),
            from: [layer('ui')],
            message: 'store/ holds client state; it must not depend on ui/.',
          },
          {
            target: './src/modules/cart/**',
            from: ['./src/modules/products/**'],
            message: 'cart/ must not import the products module; the page passes product data in.',
          },
          // The plugin does not allow mixing glob and literal paths in one zone.
          {
            target: `${MODULES}/**`,
            from: ['./src/app/**'],
            message: 'Modules must not depend on routes.',
          },
          {
            target: `${MODULES}/**`,
            from: ['./src/composition-root.ts'],
            message: 'Modules must not depend on the composition root; receive adapters instead.',
          },
        ],
      },
    ],
  },
}

const frameworkFreeLayers = {
  files: ['src/modules/*/domain/**/*.{ts,tsx}', 'src/modules/*/application/**/*.{ts,tsx}'],
  ignores: ['**/*.test.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: ['react', 'react-dom', 'next', 'zustand'].map((name) => ({
          name,
          message: 'domain/ and application/ must stay framework-free.',
        })),
        patterns: [
          {
            group: ['next/*', 'react-dom/*', 'zustand/*'],
            message: 'domain/ and application/ must stay framework-free.',
          },
        ],
      },
    ],
  },
}

// Playwright fixtures receive a callback named `use`; it is not React's `use` hook.
const e2eOverrides = {
  files: ['e2e/**/*.ts'],
  rules: { 'react-hooks/rules-of-hooks': 'off' },
}

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  ...delosiBase,
  architectureRules,
  frameworkFreeLayers,
  e2eOverrides,
  globalIgnores(['.next/**', 'out/**', 'coverage/**', 'next-env.d.ts']),
])
