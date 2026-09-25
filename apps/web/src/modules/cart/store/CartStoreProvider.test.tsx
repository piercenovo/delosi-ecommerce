import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { selectTotalItems } from '../domain/cart-selectors'
import { CART_STORAGE_KEY, CART_STORAGE_VERSION } from './cart-store'
import { CartStoreProvider } from './CartStoreProvider'
import { useCartHydrated, useCartStore } from './hooks'

const line = { productId: 5, title: 'Naga Bracelet', price: 695, image: '/images/products/5.png' }
const save = (quantity: number) =>
  window.localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify({ state: { items: [{ ...line, quantity }] }, version: CART_STORAGE_VERSION }),
  )

function CartProbe() {
  const hydrated = useCartHydrated()
  const total = useCartStore(selectTotalItems)
  const add = useCartStore((state) => state.add)
  return (
    <>
      <p>{hydrated ? `Total: ${total}` : 'Cargando carrito'}</p>
      <button
        type="button"
        onClick={() => add({ id: 7, title: 'Ring', price: 9.99, image: '/r.png' })}
      >
        Agregar
      </button>
    </>
  )
}

const tree = (
  <CartStoreProvider>
    <CartProbe />
  </CartStoreProvider>
)

describe('CartStoreProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the not-hydrated placeholder on the server, even with a saved cart', () => {
    save(3)

    expect(renderToString(tree)).toContain('Cargando carrito')
  })

  it('restores the saved cart after mounting', () => {
    save(3)

    render(tree)

    expect(screen.getByText('Total: 3')).toBeInTheDocument()
  })

  it('saves changes so they survive a reload', async () => {
    const { unmount } = render(tree)
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }))
    unmount()

    render(tree)

    expect(screen.getByText('Total: 1')).toBeInTheDocument()
  })

  it('follows changes made in another tab', () => {
    render(tree)
    expect(screen.getByText('Total: 0')).toBeInTheDocument()

    save(4)
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: CART_STORAGE_KEY }))
    })

    expect(screen.getByText('Total: 4')).toBeInTheDocument()
  })

  it('ignores storage events for other keys', () => {
    render(tree)
    save(4)

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'theme' }))
    })

    expect(screen.getByText('Total: 0')).toBeInTheDocument()
  })

  it('fails loudly when a cart hook is used outside the Provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<CartProbe />)).toThrow(/inside <CartStoreProvider>/)
  })
})
