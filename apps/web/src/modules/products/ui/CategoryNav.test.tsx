import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { categories } from '@/test/product-fixtures'
import { routerMock } from '@/test/next-router-mock'
import { CatalogNavigationProvider } from './catalog-navigation'
import { CategoryNav } from './CategoryNav'

vi.mock('next/navigation', async () => {
  const { routerMock } = await import('@/test/next-router-mock')
  return { useRouter: () => routerMock }
})

function renderNav(query: Parameters<typeof CategoryNav>[0]['query']) {
  render(
    <CatalogNavigationProvider>
      <CategoryNav categories={categories} query={query} />
    </CatalogNavigationProvider>,
  )
  return within(screen.getByRole('navigation', { name: 'Categorías' }))
}

describe('CategoryNav', () => {
  it('links every category, keeping the search and the order', () => {
    const nav = renderNav({ q: 'gold', sort: 'rating' })

    expect(nav.getByRole('link', { name: 'Todo' })).toHaveAttribute(
      'href',
      '/products?q=gold&sort=rating',
    )
    expect(nav.getByRole('link', { name: 'Joyería' })).toHaveAttribute(
      'href',
      '/products?category=jewelery&q=gold&sort=rating',
    )
    expect(nav.getAllByRole('link')).toHaveLength(categories.length + 1)
  })

  it('marks the active category as the current page', () => {
    const nav = renderNav({ category: 'jewelery' })

    expect(nav.getByRole('link', { name: 'Joyería' })).toHaveAttribute('aria-current', 'page')
    expect(nav.getByRole('link', { name: 'Todo' })).not.toHaveAttribute('aria-current')
  })

  describe('in the scrollable mobile row', () => {
    // jsdom has no layout: give the row a 300px viewport over 900px of chips, and place each
    // chip by its label.
    const chipBoxes: Record<string, { left: number; right: number }> = {
      Todo: { left: 16, right: 80 },
      'Ropa de mujer': { left: 500, right: 620 },
    }

    beforeEach(() => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
      ) {
        const box = this.tagName === 'NAV' ? { left: 0, right: 300 } : chipBoxes[this.textContent]
        return DOMRect.fromRect({ x: box?.left ?? 0, width: (box?.right ?? 0) - (box?.left ?? 0) })
      })
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        get(this: HTMLElement) {
          return this.tagName === 'NAV' ? 900 : 0
        },
      })
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        get(this: HTMLElement) {
          return this.tagName === 'NAV' ? 300 : 0
        },
      })
    })

    afterEach(() => {
      Reflect.deleteProperty(HTMLElement.prototype, 'scrollWidth')
      Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth')
    })

    it('scrolls the row, not the page, to show an active category out of view', () => {
      renderNav({ category: 'womens-clothing' })

      expect(screen.getByRole('navigation', { name: 'Categorías' }).scrollLeft).toBe(320)
    })

    it('leaves the row alone when the active category is already visible', () => {
      renderNav({})

      expect(screen.getByRole('navigation', { name: 'Categorías' }).scrollLeft).toBe(0)
    })

    // Chromium moves the Tab starting point to the element scrollIntoView scrolls: the first
    // Tab after load skipped the skip link and the header and landed on the next category.
    it('never uses scrollIntoView, so the focus order starts at the top of the page', () => {
      const scrollIntoView = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoView

      renderNav({ category: 'womens-clothing' })

      expect(scrollIntoView).not.toHaveBeenCalled()
      Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
    })
  })

  it('marks "Todo" as current without a category', () => {
    const nav = renderNav({})

    expect(nav.getByRole('link', { name: 'Todo' })).toHaveAttribute('aria-current', 'page')
  })

  it('navigates in a transition on a plain click', async () => {
    const nav = renderNav({})

    await userEvent.click(nav.getByRole('link', { name: 'Joyería' }))

    expect(routerMock.push).toHaveBeenCalledExactlyOnceWith('/products?category=jewelery', {
      scroll: false,
    })
  })

  it('leaves modified clicks (new tab, new window) to the browser', async () => {
    const nav = renderNav({})
    const user = userEvent.setup()

    await user.keyboard('{Control>}')
    await user.click(nav.getByRole('link', { name: 'Joyería' }))

    expect(routerMock.push).not.toHaveBeenCalled()
  })
})
