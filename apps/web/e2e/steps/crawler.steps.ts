import { expect, Then, When } from '../fixtures'

// Bingbot is an "HTML-limited" crawler for Next.js: it gets metadata in <head>, before the
// body streams (users get it streamed, see scripts/lighthouse.ts).
const CRAWLER_UA = 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'

function head(html: string): string {
  return html.slice(0, html.indexOf('</head>'))
}

When('un buscador pide la página {string}', async ({ request, site }, path: string) => {
  const response = await request.get(`${site.origin}${path}`, {
    headers: { 'user-agent': CRAWLER_UA },
  })
  expect(response.ok()).toBe(true)
  site.crawledHtml = await response.text()
})

Then('el head incluye la URL canónica {string}', async ({ site }, path: string) => {
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(head(site.crawledHtml))?.[1]
  expect(canonical?.endsWith(path.replaceAll('&', '&amp;'))).toBe(true)
})

Then('el head incluye la descripción {string}', async ({ site }, start: string) => {
  const description = /<meta name="description" content="([^"]+)"/.exec(head(site.crawledHtml))?.[1]
  expect(description?.startsWith(start)).toBe(true)
})
