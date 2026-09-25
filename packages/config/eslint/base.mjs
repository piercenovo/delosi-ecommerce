import prettier from 'eslint-config-prettier/flat'

/**
 * Shared rules for every TypeScript package.
 * Consumers must register the @typescript-eslint plugin themselves
 * (eslint-config-next/typescript in apps, typescript-eslint in libraries).
 *
 * @type {import('eslint').Linter.Config[]}
 */
const delosiBase = [
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    },
  },
  prettier,
]

export default delosiBase
