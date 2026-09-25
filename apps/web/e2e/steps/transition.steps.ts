import type { Page } from '@playwright/test'
import { Before, expect, Given, Then } from '../fixtures'

declare global {
  interface Window {
    /** Pseudo-elements animated by each view transition, in order (see the hook below). */
    __pageTransitions?: string[][]
  }
}

// Records what each page transition animates, before any page script runs.
Before({ tags: '@transiciones' }, async ({ page }) => {
  await page.addInitScript(() => {
    const transitions: string[][] = []
    window.__pageTransitions = transitions
    const start = document.startViewTransition?.bind(document)
    if (!start) return
    document.startViewTransition = ((update: Parameters<typeof start>[0]) => {
      const transition = start(update)
      transition.ready
        .then(() => {
          transitions.push(
            document
              .getAnimations()
              .filter(({ effect }) => Number(effect?.getTiming().duration) > 0)
              .map(({ effect }) => (effect as KeyframeEffect).pseudoElement ?? ''),
          )
        })
        .catch(() => transitions.push([]))
      return transition
    }) as typeof document.startViewTransition
  })
})

Given('que prefiero reducir el movimiento', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

const animatedPhotos = (page: Page) =>
  page.evaluate(() =>
    (window.__pageTransitions ?? [])
      .flat()
      .filter((pseudo) => pseudo.startsWith('::view-transition-group(product-image-')),
  )

Then('la foto del producto viaja de la tarjeta al detalle', async ({ page }) => {
  await expect
    .poll(() => animatedPhotos(page))
    .toContain('::view-transition-group(product-image-3)')
})

Then('la página cambia sin animar la foto', async ({ page }) => {
  // The transition still runs (the page swaps), but nothing moves.
  await expect
    .poll(() => page.evaluate(() => window.__pageTransitions?.length ?? 0))
    .toBeGreaterThan(0)
  expect(await animatedPhotos(page)).toEqual([])
})
