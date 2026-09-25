import { screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { beforeEach, describe, expect, it } from 'vitest'
import { CartStoreProvider } from '@/modules/cart/store/CartStoreProvider'
import { renderWithCart, saveCart } from '@/test/render-with-cart'
import { CartBadge } from './CartBadge'

describe('CartBadge', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('links to the cart and says it is empty, without a number', () => {
    renderWithCart(<CartBadge />)

    const link = screen.getByRole('link', { name: 'Carrito vacío' })
    expect(link).toHaveAttribute('href', '/cart')
    expect(link.textContent).not.toMatch(/\d/)
  })

  it('shows the total units and names them for screen readers', () => {
    saveCart([
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ])

    renderWithCart(<CartBadge />)

    expect(screen.getByRole('link', { name: 'Carrito, 3 productos' })).toHaveTextContent('3')
  })

  it('uses the singular for one unit', () => {
    saveCart([{ productId: 1, quantity: 1 }])

    renderWithCart(<CartBadge />)

    expect(screen.getByRole('link', { name: 'Carrito, 1 producto' })).toBeInTheDocument()
  })

  it('caps the visible number at 99+ but keeps the exact total in the name', () => {
    saveCart([
      { productId: 1, quantity: 99 },
      { productId: 2, quantity: 30 },
    ])

    renderWithCart(<CartBadge />)

    expect(screen.getByRole('link', { name: 'Carrito, 129 productos' })).toHaveTextContent('99+')
  })

  it('renders a neutral link on the server, before the saved cart is read', () => {
    saveCart([{ productId: 1, quantity: 3 }])

    const html = renderToString(
      <CartStoreProvider>
        <CartBadge />
      </CartStoreProvider>,
    )

    expect(html).toContain('aria-label="Carrito"')
    expect(html).not.toContain('>3<')
  })
})
