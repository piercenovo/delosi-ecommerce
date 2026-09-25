import type { Locator, Page } from '@playwright/test'

/** /products: role- and name-based locators, the way a person (or a screen reader) finds things. */
export class CatalogPage {
  readonly heading: Locator
  readonly resultCount: Locator
  readonly products: Locator
  readonly categories: Locator
  readonly searchBox: Locator
  readonly sortSelect: Locator
  readonly emptyState: Locator
  readonly clearFilters: Locator

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 })
    this.resultCount = page.getByRole('status').filter({ hasText: /\d+ productos?/ })
    this.products = page.getByRole('list', { name: 'Productos' }).getByRole('listitem')
    this.categories = page.getByRole('navigation', { name: 'Categorías' })
    this.searchBox = page.getByRole('searchbox', { name: 'Buscar productos' })
    this.sortSelect = page.getByRole('combobox', { name: 'Ordenar por' })
    this.emptyState = page.getByRole('heading', { name: 'No encontramos productos' })
    this.clearFilters = page.getByRole('link', { name: 'Quitar filtros' })
  }

  async goto(search = ''): Promise<void> {
    await this.page.goto(`/products${search}`)
  }

  category(name: string): Locator {
    return this.categories.getByRole('link', { name, exact: true })
  }

  productLink(title: string | RegExp): Locator {
    return this.page.getByRole('list', { name: 'Productos' }).getByRole('link', { name: title })
  }

  quickAdd(title: string): Locator {
    return this.page.getByRole('button', { name: `Agregar «${title}» al carrito` })
  }

  /** Prices of the listed products, in order, from their machine-readable <data> value. */
  async prices(): Promise<number[]> {
    const values = await this.products
      .locator('data')
      .evaluateAll((elements) => elements.map((element) => (element as HTMLDataElement).value))
    return values.map(Number)
  }
}
