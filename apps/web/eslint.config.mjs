import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import delosiBase from '@delosi/config/eslint/base'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  ...delosiBase,
  globalIgnores(['.next/**', 'out/**', 'coverage/**', 'next-env.d.ts']),
])
