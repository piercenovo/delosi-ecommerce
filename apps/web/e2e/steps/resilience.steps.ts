import { DOWN_APP_URL, expect, Given, Then } from '../fixtures'

// A second app instance whose API answers 500 (see playwright.config.ts): no shared state.
Given('que la API de productos no responde', async ({ site }) => {
  site.origin = DOWN_APP_URL
})

Then('puedo {string}', async ({ page }, action: string) => {
  await expect(page.getByRole('button', { name: action })).toBeVisible()
})

Then('puedo ir a {string}', async ({ page }, destination: string) => {
  await expect(page.getByRole('link', { name: destination })).toBeVisible()
})
