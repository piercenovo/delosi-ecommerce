import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
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

  it('scrolls the active category into view within the row', () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView

    renderNav({ category: 'womens-clothing' })

    expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ block: 'nearest', inline: 'nearest' })
    expect(scrollIntoView.mock.contexts[0]).toHaveTextContent('Ropa de mujer')
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
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
