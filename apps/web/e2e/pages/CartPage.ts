import type { Locator, Page } from '@playwright/test'

export class CartPage {
  readonly heading: Locator
  readonly lines: Locator
  readonly summary: Locator
  readonly clearCart: Locator
  readonly undoClear: Locator
  readonly emptyState: Locator

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Tu carrito' })
    this.lines = page.getByRole('list', { name: 'Productos en tu carrito' }).getByRole('listitem')
    this.summary = page.getByRole('region', { name: 'Resumen' })
    this.clearCart = page.getByRole('button', { name: 'Vaciar carrito' })
    this.undoClear = page.getByRole('button', { name: 'Deshacer' })
    this.emptyState = page.getByRole('heading', { name: 'Tu carrito está vacío' })
  }

  line(title: string): Locator {
    return this.lines.filter({ has: this.page.getByRole('link', { name: title }) })
  }

  increase(title: string): Locator {
    return this.page.getByRole('button', { name: `Aumentar cantidad de «${title}»` })
  }

  decrease(title: string): Locator {
    return this.page.getByRole('button', { name: `Disminuir cantidad de «${title}»` })
  }

  remove(title: string): Locator {
    return this.page.getByRole('button', { name: `Eliminar «${title}» del carrito` })
  }
}
