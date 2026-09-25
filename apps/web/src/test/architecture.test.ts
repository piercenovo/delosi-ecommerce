// @vitest-environment node
/**
 * Guards the layer rules from AGENTS.md. Each case lints a code snippet as if it lived at
 * `filePath`, so turning the ESLint rules off makes this test fail.
 */
import path from 'node:path'
import { ESLint } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'

const WEB_DIR = path.resolve(import.meta.dirname, '../..')
const PRODUCTS = 'src/modules/products'

let eslint: ESLint

beforeAll(() => {
  eslint = new ESLint({ cwd: WEB_DIR })
})

async function restrictedImportErrors(filePath: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: path.join(WEB_DIR, filePath) })
  return (result?.messages ?? [])
    .filter((message) =>
      ['import/no-restricted-paths', 'no-restricted-imports'].includes(message.ruleId ?? ''),
    )
    .map((message) => message.message)
}

describe('architecture rules', { timeout: 30_000 }, () => {
  it.each([
    [
      'domain → infrastructure (relative path)',
      `${PRODUCTS}/domain/example.ts`,
      "import { UpstreamHttpError } from '../infrastructure/fakestore-client'\nexport const x = UpstreamHttpError\n",
      /domain\/ is pure/,
    ],
    [
      'domain → application (alias)',
      `${PRODUCTS}/domain/example.ts`,
      "import { getCatalog } from '@/modules/products/application/get-catalog'\nexport const x = getCatalog\n",
      /domain\/ is pure/,
    ],
    [
      'application → infrastructure',
      `${PRODUCTS}/application/example.ts`,
      "import { CATALOG_CACHE_TAGS } from '../infrastructure/cache-tags'\nexport const x = CATALOG_CACHE_TAGS\n",
      /application\/ depends only on domain/,
    ],
    [
      'ui → infrastructure',
      `${PRODUCTS}/ui/example.tsx`,
      "import { CATALOG_CACHE_TAGS } from '@/modules/products/infrastructure/cache-tags'\nexport const x = CATALOG_CACHE_TAGS\n",
      /ui\/ must not use infrastructure/,
    ],
    [
      'module → composition root',
      `${PRODUCTS}/ui/example.tsx`,
      "import { productRepository } from '@/composition-root'\nexport const x = productRepository\n",
      /must not depend on the composition root/,
    ],
    [
      'domain → next',
      `${PRODUCTS}/domain/example.ts`,
      "import { notFound } from 'next/navigation'\nexport const x = notFound\n",
      /framework-free/,
    ],
    [
      'application → react',
      `${PRODUCTS}/application/example.ts`,
      "import { cache } from 'react'\nexport const x = cache\n",
      /framework-free/,
    ],
  ])('forbids %s', async (_case, filePath, code, expectedMessage) => {
    const errors = await restrictedImportErrors(filePath, code)

    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatch(expectedMessage)
  })

  it.each([
    [
      'application → domain',
      `${PRODUCTS}/application/example.ts`,
      "import { sortProducts } from '../domain/sort-strategies'\nexport const x = sortProducts\n",
    ],
    [
      'infrastructure → domain',
      `${PRODUCTS}/infrastructure/example.ts`,
      "import { CatalogUnavailableError } from '@/modules/products/domain/errors'\nexport const x = CatalogUnavailableError\n",
    ],
    [
      'app → composition root',
      'src/app/example/page.tsx',
      "import { productRepository } from '@/composition-root'\nexport const x = productRepository\n",
    ],
  ])('allows %s', async (_case, filePath, code) => {
    await expect(restrictedImportErrors(filePath, code)).resolves.toEqual([])
  })
})
