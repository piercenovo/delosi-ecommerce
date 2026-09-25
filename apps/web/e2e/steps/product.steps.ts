import { expect, Then, When } from '../fixtures'
import { literal } from './common.steps'

When('agrego el producto al carrito', async ({ product }) => {
  // Enabled once the saved cart has been read; Playwright waits for it.
  await product.addToCart.click()
})

Then(
  'la ruta de navegación muestra {string} y {string}',
  async ({ product }, first: string, second: string) => {
    await expect(product.breadcrumbs.getByRole('link', { name: first })).toBeVisible()
    await expect(product.breadcrumbs.getByRole('link', { name: second })).toBeVisible()
  },
)

Then('el título del documento empieza con {string}', async ({ page }, start: string) => {
  await expect(page).toHaveTitle(new RegExp(`^${literal(start)}`))
})

Then('la URL canónica termina en {string}', async ({ page }, path: string) => {
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    new RegExp(`${literal(path)}$`),
  )
})

Then('la imagen para compartir es {string}', async ({ page }, path: string) => {
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    new RegExp(`${literal(path)}$`),
  )
})

Then(
  'los datos estructurados describen un {string} con precio {string} en {string}',
  async ({ product }, type: string, price: string, currency: string) => {
    const described = (await product.jsonLd()).find((block) => block['@type'] === type)
    expect(described?.offers).toMatchObject({ price, priceCurrency: currency })
  },
)

Then('los datos estructurados incluyen la ruta de navegación', async ({ product }) => {
  const types = (await product.jsonLd()).map((block) => block['@type'])
  expect(types).toContain('BreadcrumbList')
})

Then('veo {int} productos relacionados', async ({ product }, count: number) => {
  await expect(product.related.getByRole('listitem')).toHaveCount(count)
})
