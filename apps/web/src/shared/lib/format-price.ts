// Created once: building an Intl.NumberFormat is far more expensive than formatting.
const priceFormatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'USD' })

/** FakeStore prices are in US dollars; shown with Peruvian conventions (`USD 64.00`). */
export function formatPrice(amount: number): string {
  return priceFormatter.format(amount)
}
