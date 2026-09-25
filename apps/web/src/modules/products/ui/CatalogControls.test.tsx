import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { routerMock } from '@/test/next-router-mock'
import type { CatalogQuery } from '../domain/catalog-query'
import { CatalogControls, SEARCH_DEBOUNCE_MS } from './CatalogControls'
import { CatalogNavigationProvider } from './catalog-navigation'

vi.mock('next/navigation', async () => {
  const { routerMock } = await import('@/test/next-router-mock')
  return { useRouter: () => routerMock }
})

function renderControls(query: CatalogQuery) {
  const ui = (current: CatalogQuery) => (
    <CatalogNavigationProvider>
      <CatalogControls query={current} />
    </CatalogNavigationProvider>
  )
  const result = render(ui(query))
  return { ...result, rerenderWith: (next: CatalogQuery) => result.rerender(ui(next)) }
}

const searchBox = () => screen.getByRole('searchbox', { name: 'Buscar productos' })
const sortSelect = () => screen.getByRole('combobox', { name: 'Ordenar por' })

describe('CatalogControls', () => {
  beforeEach(() => {
    // Real time keeps flowing for user-event; the debounce is still advanced explicitly.
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

  it('is a native GET form to the catalog with the current state', () => {
    renderControls({ category: 'jewelery', q: 'gold', sort: 'price-asc' })

    const form = screen.getByRole('search')
    expect(form).toHaveAttribute('method', 'get')
    expect(form).toHaveAttribute('action', '/products')
    expect(searchBox()).toHaveAttribute('name', 'q')
    expect(searchBox()).toHaveValue('gold')
    expect(sortSelect()).toHaveAttribute('name', 'sort')
    expect(sortSelect()).toHaveValue('price-asc')
    expect(form.querySelector('input[type=hidden][name=category]')).toHaveValue('jewelery')
  })

  it('searches once, after the person stops typing, keeping the other filters', async () => {
    renderControls({ category: 'jewelery', sort: 'price-asc' })

    await user().type(searchBox(), 'gold')
    expect(routerMock.replace).not.toHaveBeenCalled()

    await act(() => vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS))

    expect(routerMock.replace).toHaveBeenCalledOnce()
    expect(routerMock.replace).toHaveBeenCalledWith(
      '/products?category=jewelery&q=gold&sort=price-asc',
      { scroll: false },
    )
  })

  it('does not navigate when the normalized search did not change', async () => {
    renderControls({ q: 'gold' })

    await user().type(searchBox(), '  ')
    await act(() => vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS))

    expect(routerMock.replace).not.toHaveBeenCalled()
  })

  it('submits right away on Enter, cancelling the pending search', async () => {
    renderControls({})

    await user().type(searchBox(), 'shirt{Enter}')
    await act(() => vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS))

    expect(routerMock.push).toHaveBeenCalledExactlyOnceWith('/products?q=shirt', { scroll: false })
    expect(routerMock.replace).not.toHaveBeenCalled()
  })

  it('sorts as soon as the order changes, as a new history entry', async () => {
    renderControls({ q: 'gold' })

    await user().selectOptions(sortSelect(), 'rating')

    expect(sortSelect()).toHaveValue('rating')
    expect(routerMock.push).toHaveBeenCalledExactlyOnceWith('/products?q=gold&sort=rating', {
      scroll: false,
    })
  })

  it('follows the URL when it changes elsewhere (back button, "Quitar filtros")', () => {
    const { rerenderWith } = renderControls({ q: 'gold', sort: 'rating' })

    rerenderWith({})

    expect(searchBox()).toHaveValue('')
    expect(sortSelect()).toHaveValue('')
  })
})
