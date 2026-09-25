import { defineConfig, globalIgnores } from 'eslint/config'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import storybook from 'eslint-plugin-storybook'
import tseslint from 'typescript-eslint'
import delosiBase from '@delosi/config/eslint/base'

export default defineConfig([
  tseslint.configs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  jsxA11y.flatConfigs.strict,
  storybook.configs['flat/recommended'],
  ...delosiBase,
  globalIgnores(['storybook-static/**', 'coverage/**', '!.storybook']),
])
