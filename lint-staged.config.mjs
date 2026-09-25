import path from 'node:path'

const WEB_DIR = 'apps/web'

export default {
  '*.{ts,tsx,js,mjs,cjs,json,md,css,yml,yaml}': 'prettier --write',
  'apps/web/**/*.{ts,tsx,js,mjs}': (files) => {
    const relativeFiles = files.map((file) => path.relative(path.resolve(WEB_DIR), file))
    return `pnpm --filter @delosi/web exec eslint --fix --max-warnings=0 ${relativeFiles.join(' ')}`
  },
}
