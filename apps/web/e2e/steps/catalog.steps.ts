import { expect, Given, Then, When } from '../fixtures'

Given('(que )abro el catálogo', async ({ site }) => {
  await site.open('/products')
})

When('(que )elijo la categoría {string}', async ({ catalog }, name: string) => {
  await catalog.category(name).click()
  await expect(catalog.category(name)).toHaveAttribute('aria-current', 'page')
})

When('busco {string}', async ({ catalog, page }, text: string) => {
  await catalog.searchBox.fill(text)
  // The search runs after a short pause in typing: wait for the URL it produces.
  await expect(page).toHaveURL(new RegExp(`q=${encodeURIComponent(text)}`))
})

When('ordeno por {string}', async ({ catalog }, label: string) => {
  await catalog.sortSelect.selectOption({ label })
})

When('quito los filtros', async ({ catalog }) => {
  await catalog.clearFilters.click()
})

When('(que )abro el producto {string}', async ({ catalog, page }, title: string) => {
  await catalog.productLink(title).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
})

When('agrego {string} desde su tarjeta', async ({ catalog }, title: string) => {
  await catalog.quickAdd(title).click()
})

Then('veo {int} producto(s)', async ({ catalog }, count: number) => {
  await expect(catalog.products).toHaveCount(count)
})

Then('veo el resultado {string}', async ({ catalog }, text: string) => {
  await expect(catalog.resultCount).toHaveText(text)
})

Then('la categoría {string} está marcada como actual', async ({ catalog }, name: string) => {
  await expect(catalog.category(name)).toHaveAttribute('aria-current', 'page')
})

Then('los precios están en orden {word}', async ({ catalog }, direction: string) => {
  const sign = direction === 'ascendente' ? 1 : -1
  // Sorting is a client navigation: poll until the grid shows the sorted result.
  await expect
    .poll(async () => {
      const prices = await catalog.prices()
      return prices.every((price, index) => index === 0 || sign * (price - prices[index - 1]!) >= 0)
    })
    .toBe(true)
})
