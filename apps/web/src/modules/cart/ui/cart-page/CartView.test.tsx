import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { beforeEach, describe, expect, it } from 'vitest'
import { CartStoreProvider } from '@/modules/cart/store/CartStoreProvider'
import { renderWithCart, saveCart } from '@/test/render-with-cart'
import { CartView } from './CartView'

const lines = () =>
  within(screen.getByRole('list', { name: 'Productos en tu carrito' })).getAllByRole('listitem')
const summary = () => screen.getByRole('region', { name: 'Resumen' })

// toHaveTextContent normalizes the element's whitespace (the price's non-breaking space
// becomes a plain one), so expectations use plain spaces.
describe('CartView', () => {
  beforeEach(() => {
    window.localStorage.clear()
    saveCart([
      { productId: 5, quantity: 1, price: 695, title: 'Naga Bracelet' },
      { productId: 7, quantity: 2, price: 9.99, title: 'Princess Ring' },
    ])
  })

  it('lists each product with a link, unit price and line total', () => {
    renderWithCart(<CartView />)

    expect(lines()).toHaveLength(2)
    const ring = lines()[1] as HTMLElement
    expect(within(ring).getByRole('link', { name: 'Princess Ring' })).toHaveAttribute(
      'href',
      '/products/7',
    )
    expect(ring).toHaveTextContent('USD 9.99 cada uno')
    expect(ring).toHaveTextContent('USD 19.98')
  })

  it('sums units and subtotal in the summary', () => {
    renderWithCart(<CartView />)

    expect(summary()).toHaveTextContent('Productos3')
    expect(summary()).toHaveTextContent('SubtotalUSD 714.98')
    expect(summary()).toHaveTextContent('El pago no forma parte de esta demo.')
  })

  it('updates the subtotal when a quantity changes', async () => {
    renderWithCart(<CartView />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Aumentar cantidad de «Princess Ring»' }),
    )

    expect(summary()).toHaveTextContent('Productos4')
    expect(summary()).toHaveTextContent('SubtotalUSD 724.97')
  })

  it('removes a line and moves focus to the next one', async () => {
    renderWithCart(<CartView />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Eliminar «Naga Bracelet» del carrito' }),
    )

    expect(lines()).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Princess Ring' })).toHaveFocus()
  })

  it('moves focus to the previous line when the last one is removed', async () => {
    renderWithCart(<CartView />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Eliminar «Princess Ring» del carrito' }),
    )

    expect(screen.getByRole('link', { name: 'Naga Bracelet' })).toHaveFocus()
  })

  it('shows the empty state, with focus on the page title, when the cart is emptied', async () => {
    renderWithCart(<CartView />)

    await userEvent.click(screen.getByRole('button', { name: 'Vaciar carrito' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Tu carrito' })).toHaveFocus()
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver el catálogo' })).toHaveAttribute(
      'href',
      '/products',
    )
  })

  it('keeps the changes after leaving and coming back', async () => {
    const { unmount } = renderWithCart(<CartView />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Eliminar «Naga Bracelet» del carrito' }),
    )
    unmount()

    renderWithCart(<CartView />)

    expect(lines()).toHaveLength(1)
  })

  it('renders a loading placeholder on the server, never the saved lines', () => {
    const html = renderToString(
      <CartStoreProvider>
        <CartView />
      </CartStoreProvider>,
    )

    expect(html).toContain('Cargando tu carrito')
    expect(html).not.toContain('Princess Ring')
  })
})
