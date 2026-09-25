import AxeBuilder from '@axe-core/playwright'
import type { Response } from '@playwright/test'
import { createBdd, test as base } from 'playwright-bdd'
import { APP_URL, DOWN_APP_URL } from '../playwright.config'
import { CartPage } from './pages/CartPage'
import { CatalogPage } from './pages/CatalogPage'
import { Header } from './pages/Header'
import { ProductPage } from './pages/ProductPage'

export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/** Per-scenario state shared by steps: which app instance, and the last navigation. */
export interface Site {
  origin: string
  lastResponse: Response | null
  /** Navigates within the current app instance and remembers the response (status codes). */
  open(path: string): Promise<void>
}

interface Fixtures {
  site: Site
  header: Header
  catalog: CatalogPage
  product: ProductPage
  cart: CartPage
  /** axe-core scoped to WCAG 2.2 AA, the level the design system targets. */
  makeAxeBuilder: () => AxeBuilder
}

/** Every scenario gets a fresh browser context: localStorage (the cart) never leaks. */
export const test = base.extend<Fixtures>({
  site: async ({ page }, use) => {
    const site: Site = {
      origin: APP_URL,
      lastResponse: null,
      async open(path) {
        site.lastResponse = await page.goto(`${site.origin}${path}`)
      },
    }
    await use(site)
  },
  header: async ({ page }, use) => use(new Header(page)),
  catalog: async ({ page }, use) => use(new CatalogPage(page)),
  product: async ({ page }, use) => use(new ProductPage(page)),
  cart: async ({ page }, use) => use(new CartPage(page)),
  makeAxeBuilder: async ({ page }, use) => use(() => new AxeBuilder({ page }).withTags(WCAG_TAGS)),
})

export const { Given, When, Then, Before } = createBdd(test)

export { DOWN_APP_URL }
export { expect } from '@playwright/test'
