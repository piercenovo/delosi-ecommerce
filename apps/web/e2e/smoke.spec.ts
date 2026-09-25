import { DOWN_APP_URL } from '../playwright.config'
import { expect, test } from './fixtures'

// Infrastructure check for the E2E setup (mock + two app instances, three browsers).
// The behaviour itself is specified in the BDD features.
test.describe('smoke', () => {
  test('find a product and add it to the cart', async ({ catalog, product, header, cart }) => {
    await catalog.goto()
    await expect(catalog.products).toHaveCount(20)

    await catalog.productLink(/Mens Cotton Jacket/).click()
    await expect(product.heading).toHaveText('Mens Cotton Jacket')

    await product.addToCart.click()
    await expect(header.cartLink).toHaveAccessibleName('Carrito, 1 producto')

    await header.cartLink.click()
    await expect(cart.line('Mens Cotton Jacket')).toBeVisible()
  })

  test('the catalog has no WCAG 2.2 AA violations', async ({ catalog, makeAxeBuilder }) => {
    await catalog.goto()
    await expect(catalog.products).toHaveCount(20)

    const { violations } = await makeAxeBuilder().analyze()
    expect(violations).toEqual([])
  })

  test('a failing API reaches the error page', async ({ page }) => {
    await page.goto(`${DOWN_APP_URL}/products`)

    await expect(
      page.getByRole('heading', { level: 1, name: 'No pudimos cargar los productos' }),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Intentar de nuevo' })).toBeVisible()
  })
})
