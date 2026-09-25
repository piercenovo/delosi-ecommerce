import path from 'node:path'

/** Each workspace package runs ESLint with its own config. */
const LINTED_PACKAGES = {
  'apps/web': '@delosi/web',
  'packages/ui': '@delosi/ui',
}

function eslintFor(directory, packageName) {
  return (files) => {
    const relativeFiles = files.map((file) => path.relative(path.resolve(directory), file))
    return `pnpm --filter ${packageName} exec eslint --fix --max-warnings=0 ${relativeFiles.join(' ')}`
  }
}

export default {
  '*.{ts,tsx,js,mjs,cjs,json,md,mdx,css,yml,yaml}': 'prettier --write',
  ...Object.fromEntries(
    Object.entries(LINTED_PACKAGES).map(([directory, packageName]) => [
      `${directory}/**/*.{ts,tsx,js,mjs}`,
      eslintFor(directory, packageName),
    ]),
  ),
}
