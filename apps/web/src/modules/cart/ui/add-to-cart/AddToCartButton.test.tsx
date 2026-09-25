import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithCart, saveCart } from '@/test/render-with-cart'
import { MAX_QUANTITY, type CartProduct } from '../../domain/cart'
import { AddToCartButton } from './AddToCartButton'
import { CartBadge } from '../CartBadge'
import { ADDED_FEEDBACK_MS } from './use-add-to-cart'

const product: CartProduct = {
  id: 5,
  title: 'Naga Bracelet',
  price: 695,
  image: '/images/products/5.png',
}

function renderPage() {
  return renderWithCart(
    <>
      <CartBadge />
      <AddToCartButton product={product} />
    </>,
  )
}

const addButton = () => screen.getByRole('button', { name: /Agregar al carrito|Agregado/ })

describe('AddToCartButton', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

  it('adds the product and the header count follows', async () => {
    renderPage()

    await user().click(addButton())
    expect(screen.getByRole('link', { name: 'Carrito, 1 producto' })).toBeInTheDocument()

    await user().click(addButton())
    expect(screen.getByRole('link', { name: 'Carrito, 2 productos' })).toBeInTheDocument()
  })

  it('announces what happened once, with the new cart total', async () => {
    saveCart([{ productId: 9, quantity: 2 }])
    renderPage()

    await user().click(addButton())

    expect(screen.getByRole('status')).toHaveTextContent(
      'Agregaste «Naga Bracelet». Tienes 3 productos en el carrito.',
    )
  })

  it('confirms with "Agregado" for a moment, then offers adding again', async () => {
    renderPage()

    await user().click(addButton())
    expect(screen.getByRole('button', { name: 'Agregado' })).toBeInTheDocument()

    await act(() => vi.advanceTimersByTimeAsync(ADDED_FEEDBACK_MS))
    expect(screen.getByRole('button', { name: 'Agregar al carrito' })).toBeInTheDocument()
  })

  it('tells how many are already in the cart, with a link to it', async () => {
    saveCart([{ productId: 5, quantity: 1 }])
    renderPage()

    await user().click(addButton())

    expect(screen.getByText(/Ya tienes 2 en tu carrito/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver carrito' })).toHaveAttribute('href', '/cart')
  })

  it('says nothing about the cart when the product is not in it', () => {
    renderPage()

    expect(screen.queryByText(/Ya tienes/)).not.toBeInTheDocument()
  })

  it(`is disabled at the limit of ${MAX_QUANTITY} units`, () => {
    saveCart([{ productId: 5, quantity: MAX_QUANTITY }])
    renderPage()

    expect(addButton()).toBeDisabled()
    expect(screen.getByText(`Llegaste al máximo de ${MAX_QUANTITY} unidades.`)).toBeInTheDocument()
  })
})
