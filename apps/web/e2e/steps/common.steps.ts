import { expect, Given, Then, When } from '../fixtures'

/** Escapes text for use inside a RegExp. */
export const literal = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Prices print with a non-breaking space ("USD 111.98"): match any whitespace there. */
export const withAnySpace = (text: string) => new RegExp(literal(text).replace(/ /g, '\\s'))

Given('(que )abro la página {string}', async ({ site }, path: string) => {
  await site.open(path)
})

When('recargo la página', async ({ page }) => {
  await page.reload()
})

When('vuelvo atrás', async ({ page }) => {
  await page.goBack()
})

Then('el título de la página es {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
})

Then('la dirección incluye {string}', async ({ page }, fragment: string) => {
  await expect(page).toHaveURL(new RegExp(literal(fragment)))
})

Then('veo el mensaje {string}', async ({ page }, message: string) => {
  await expect(page.getByRole('heading', { name: message })).toBeVisible()
})

Then('veo {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible()
})

Then('la respuesta tiene el estado {int}', async ({ site }, status: number) => {
  expect(site.lastResponse?.status()).toBe(status)
})

Then('la página pide no ser indexada', async ({ page }) => {
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/)
})
