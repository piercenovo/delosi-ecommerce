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
const CART = 'src/modules/cart'

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
      "import { UpstreamHttpError } from '../infrastructure/fakestore/fakestore-client'\nexport const x = UpstreamHttpError\n",
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
      "import { CATALOG_CACHE_TAGS } from '../infrastructure/cache/cache-tags'\nexport const x = CATALOG_CACHE_TAGS\n",
      /application\/ depends only on domain/,
    ],
    [
      'ui → infrastructure',
      `${PRODUCTS}/ui/example.tsx`,
      "import { CATALOG_CACHE_TAGS } from '@/modules/products/infrastructure/cache/cache-tags'\nexport const x = CATALOG_CACHE_TAGS\n",
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
      'domain → store',
      `${CART}/domain/example.ts`,
      "import { createCartStore } from '../store/cart-store'\nexport const x = createCartStore\n",
      /domain\/ is pure/,
    ],
    [
      'store → ui',
      // The rule is generic (modules/*/store); the imported file must exist to be resolved.
      `${PRODUCTS}/store/example.ts`,
      "import { ProductGrid } from '../ui/product/ProductGrid'\nexport const x = ProductGrid\n",
      /store\/ holds client state/,
    ],
    [
      'cart → products module',
      `${CART}/ui/example.tsx`,
      "import type { Product } from '@/modules/products/domain/product'\nexport type X = Product\n",
      /cart\/ must not import the products module/,
    ],
    [
      'domain → zustand',
      `${CART}/domain/example.ts`,
      "import { createStore } from 'zustand/vanilla'\nexport const x = createStore\n",
      /framework-free/,
    ],
    [
      'application → react',
      `${PRODUCTS}/application/example.ts`,
      "import { cache } from 'react'\nexport const x = cache\n",
      /framework-free/,
    ],
    [
      'url → ui',
      `${PRODUCTS}/url/example.ts`,
      "import { ProductGrid } from '../ui/product/ProductGrid'\nexport const x = ProductGrid\n",
      /url\/ maps the URL to the domain/,
    ],
    [
      'url → next',
      `${PRODUCTS}/url/example.ts`,
      "import { redirect } from 'next/navigation'\nexport const x = redirect\n",
      /framework-free/,
    ],
    [
      'seo → infrastructure',
      `${PRODUCTS}/seo/example.ts`,
      "import { CATALOG_CACHE_TAGS } from '../infrastructure/cache/cache-tags'\nexport const x = CATALOG_CACHE_TAGS\n",
      /seo\/ builds metadata from domain data/,
    ],
    [
      'seo → application',
      `${PRODUCTS}/seo/example.ts`,
      "import { getCatalog } from '../application/get-catalog'\nexport const x = getCatalog\n",
      /seo\/ builds metadata from domain data/,
    ],
    [
      'domain → url',
      `${PRODUCTS}/domain/example.ts`,
      "import { buildCatalogHref } from '../url/catalog-search-params'\nexport const x = buildCatalogHref\n",
      /domain\/ is pure/,
    ],
    [
      'application → seo',
      `${PRODUCTS}/application/example.ts`,
      "import { buildSitemap } from '../seo/sitemap'\nexport const x = buildSitemap\n",
      /application\/ depends only on domain/,
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
      'store → domain (and zustand)',
      `${CART}/store/example.ts`,
      "import { createStore } from 'zustand/vanilla'\nimport { cartReducer } from '../domain/cart-reducer'\nexport const x = [createStore, cartReducer]\n",
    ],
    [
      'ui → store',
      `${CART}/ui/example.tsx`,
      "import { useCartStore } from '@/modules/cart/store/hooks'\nexport const x = useCartStore\n",
    ],
    [
      'app → composition root',
      'src/app/example/page.tsx',
      "import { productRepository } from '@/composition-root'\nexport const x = productRepository\n",
    ],
    [
      'url → domain (and zod)',
      `${PRODUCTS}/url/example.ts`,
      "import { z } from 'zod'\nimport { SORT_KEYS } from '../domain/catalog-query'\nexport const x = [z, SORT_KEYS]\n",
    ],
    [
      'seo → url and domain',
      `${PRODUCTS}/seo/example.ts`,
      "import { buildCatalogHref } from '../url/catalog-search-params'\nimport { sortProducts } from '../domain/sort-strategies'\nexport const x = [buildCatalogHref, sortProducts]\n",
    ],
    [
      'ui → url',
      `${PRODUCTS}/ui/example.tsx`,
      "import { parseCatalogQuery } from '../url/catalog-search-params'\nexport const x = parseCatalogQuery\n",
    ],
  ])('allows %s', async (_case, filePath, code) => {
    await expect(restrictedImportErrors(filePath, code)).resolves.toEqual([])
  })
})
