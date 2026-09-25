import { Before, expect, Then, When } from '../fixtures'

// WebKit follows the macOS "keyboard navigation" setting (links are skipped by default) and a
// phone has no Tab key: keyboard scenarios run on desktop Chromium.
Before({ tags: '@teclado' }, async ({ $test, browserName, isMobile }) => {
  $test.skip(browserName === 'webkit' || isMobile, 'Keyboard scenarios run on desktop Chromium')
})

// A keyboard user presses Tab on a loaded page. Wait until it is interactive: the cart link
// only gets its final name after hydration, and no request (the catalog stream) is pending.
When('presiono Tab', async ({ page, header }) => {
  await expect(header.cartLink).toHaveAccessibleName('Carrito vacío')
  await page.waitForLoadState('networkidle')
  await page.keyboard.press('Tab')
})

When('llego con Tab a {string} y presiono Enter', async ({ page }, name: string) => {
  const target = page.getByRole('button', { name })
  await expect(target).toBeEnabled()
  for (let presses = 0; presses < 60; presses += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) break
    await page.keyboard.press('Tab')
  }
  await expect(target).toBeFocused()
  await page.keyboard.press('Enter')
})

Then('el foco está en {string}', async ({ page }, name: string) => {
  await expect(page.locator(':focus')).toHaveAccessibleName(name)
})

Then('no hay violaciones de accesibilidad', async ({ page, makeAxeBuilder }) => {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const { violations } = await makeAxeBuilder().analyze()
  expect(violations.map(({ id, nodes }) => `${id} (${nodes.length})`)).toEqual([])
})
