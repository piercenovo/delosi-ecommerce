import AxeBuilder from '@axe-core/playwright'
import { test as base } from '@playwright/test'
import { CartPage } from './pages/CartPage'
import { CatalogPage } from './pages/CatalogPage'
import { Header } from './pages/Header'
import { ProductPage } from './pages/ProductPage'

export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

interface Fixtures {
  header: Header
  catalog: CatalogPage
  product: ProductPage
  cart: CartPage
  /** axe-core scoped to WCAG 2.2 AA, the level the design system targets. */
  makeAxeBuilder: () => AxeBuilder
}

/** Every test gets a fresh browser context: localStorage (the cart) never leaks between tests. */
export const test = base.extend<Fixtures>({
  header: async ({ page }, use) => use(new Header(page)),
  catalog: async ({ page }, use) => use(new CatalogPage(page)),
  product: async ({ page }, use) => use(new ProductPage(page)),
  cart: async ({ page }, use) => use(new CartPage(page)),
  makeAxeBuilder: async ({ page }, use) => use(() => new AxeBuilder({ page }).withTags(WCAG_TAGS)),
})

export { expect } from '@playwright/test'
