import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { beforeEach, describe, expect, it } from 'vitest'
import { CartProvider } from '@/modules/cart/ui/CartProvider'
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

  it('offers "Seguir comprando" as the main action, and emptying the cart as a minor one', () => {
    renderWithCart(<CartView />)

    const links = within(summary()).getAllByRole('link')
    expect(links[0]).toHaveAccessibleName('Seguir comprando')
    expect(links[0]).toHaveAttribute('href', '/products')
    expect(within(summary()).getByRole('button', { name: 'Vaciar carrito' })).toBeInTheDocument()
  })

  it('empties the cart without asking, and offers to undo it', async () => {
    renderWithCart(<CartView />)

    await userEvent.click(screen.getByRole('button', { name: 'Vaciar carrito' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Tu carrito' })).toHaveFocus()
    expect(screen.getByRole('heading', { name: 'Vaciaste tu carrito' })).toBeInTheDocument()
    expect(screen.getByText('Quitamos 3 productos.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Deshacer' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver el catálogo' })).toHaveAttribute(
      'href',
      '/products',
    )
    expect(
      screen.getByText('Vaciaste tu carrito. Puedes deshacerlo con el botón Deshacer.'),
    ).toHaveAttribute('role', 'status')
  })

  it('brings back every line, with its quantity, when the emptying is undone', async () => {
    renderWithCart(<CartView />)
    await userEvent.click(screen.getByRole('button', { name: 'Vaciar carrito' }))

    await userEvent.click(screen.getByRole('button', { name: 'Deshacer' }))

    expect(lines()).toHaveLength(2)
    expect(lines()[0]).toHaveTextContent('Naga Bracelet')
    expect(screen.getByRole('group', { name: 'Cantidad de «Princess Ring»' })).toHaveTextContent(
      '2',
    )
    expect(summary()).toHaveTextContent('Productos3')
    expect(screen.getByRole('link', { name: 'Naga Bracelet' })).toHaveFocus()
    expect(screen.getByText('Recuperaste 3 productos.')).toHaveAttribute('role', 'status')
  })

  it('shows the plain empty state, with nothing to undo, when the cart was already empty', () => {
    window.localStorage.clear()
    renderWithCart(<CartView />)

    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Deshacer' })).not.toBeInTheDocument()
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
      <CartProvider>
        <CartView />
      </CartProvider>,
    )

    expect(html).toContain('Cargando tu carrito')
    expect(html).not.toContain('Princess Ring')
  })
})
