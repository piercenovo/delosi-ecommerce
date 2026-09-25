import type { Locator, Page } from '@playwright/test'

export class Header {
  readonly cartLink: Locator

  constructor(page: Page) {
    this.cartLink = page.getByRole('banner').getByRole('link', { name: /^Carrito/ })
  }
}
