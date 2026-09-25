import { expect, Given, Then, When } from '../fixtures'
import { withAnySpace } from './common.steps'

const cartName = (count: number) => `Carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`

Given('(que )tengo {string} en el carrito', async ({ site, catalog, header }, title: string) => {
  await site.open('/products')
  const quickAdd = catalog.quickAdd(title)
  await expect(quickAdd).toBeEnabled() // the saved cart has been read
  const before = await header.cartLink.getAttribute('aria-label')
  await quickAdd.click()
  await expect(header.cartLink).not.toHaveAttribute('aria-label', before ?? '')
})

When('abro el carrito', async ({ header, cart }) => {
  await header.cartLink.click()
  await expect(cart.heading).toBeVisible()
})

When('aumento la cantidad de {string}', async ({ cart }, title: string) => {
  await cart.increase(title).click()
})

When('elimino {string}', async ({ cart }, title: string) => {
  await cart.remove(title).click()
})

When('vacío el carrito', async ({ cart }) => {
  await cart.clearCart.click()
})

Then('el carrito tiene {int} producto(s)', async ({ header }, count: number) => {
  await expect(header.cartLink).toHaveAccessibleName(cartName(count))
})

Then('el subtotal es {string}', async ({ cart }, amount: string) => {
  await expect(cart.summary).toContainText(withAnySpace(`Subtotal${amount}`))
})
