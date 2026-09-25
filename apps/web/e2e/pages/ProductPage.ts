import type { Locator, Page } from '@playwright/test'

export class ProductPage {
  readonly heading: Locator
  readonly addToCart: Locator
  readonly inCartHint: Locator
  readonly breadcrumbs: Locator
  readonly related: Locator

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 })
    this.addToCart = page.getByRole('button', { name: /^(Agregar al carrito|Agregado)$/ })
    this.inCartHint = page.getByText(/Ya tienes \d+ en tu carrito/)
    this.breadcrumbs = page.getByRole('navigation', { name: 'Ruta de navegación' })
    this.related = page.getByRole('region', { name: 'También te puede interesar' })
  }

  /** Structured data embedded in the page, parsed as a crawler would. */
  async jsonLd(): Promise<Record<string, unknown>[]> {
    const blocks = await this.page.locator('script[type="application/ld+json"]').allTextContents()
    return blocks.map((block) => JSON.parse(block) as Record<string, unknown>)
  }
}
