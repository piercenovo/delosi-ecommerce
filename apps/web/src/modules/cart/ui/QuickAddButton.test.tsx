import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithCart, saveCart } from '@/test/render-with-cart'
import { MAX_QUANTITY } from '../domain/cart'
import { CartBadge } from './CartBadge'
import { QuickAddButton } from './QuickAddButton'
import { ADDED_FEEDBACK_MS } from './use-add-to-cart'

const jacket = { id: 3, title: 'Mens Cotton Jacket', price: 55.99, image: '/images/products/3.png' }
const shirt = {
  id: 2,
  title: 'Mens Casual Premium Slim Fit',
  price: 22.3,
  image: '/images/products/2.png',
}

function renderCatalog() {
  return renderWithCart(
    <>
      <CartBadge />
      <QuickAddButton product={jacket} />
      <QuickAddButton product={shirt} />
    </>,
  )
}

const quickAdd = (title: string) =>
  screen.getByRole('button', { name: `Agregar «${title}» al carrito` })

describe('QuickAddButton', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

  it('adds from the card and the header count follows', async () => {
    renderCatalog()

    await user().click(quickAdd('Mens Cotton Jacket'))
    await user().click(quickAdd('Mens Casual Premium Slim Fit'))

    expect(screen.getByRole('link', { name: 'Carrito, 2 productos' })).toBeInTheDocument()
  })

  it('announces through the single shared live region', async () => {
    renderCatalog()

    await user().click(quickAdd('Mens Cotton Jacket'))

    const regions = screen.getAllByRole('status')
    expect(regions).toHaveLength(1)
    expect(regions[0]).toHaveTextContent(
      'Agregaste «Mens Cotton Jacket». Tienes 1 producto en el carrito.',
    )
  })

  it('keeps its accessible name while showing a check for a moment', async () => {
    renderCatalog()
    const button = quickAdd('Mens Cotton Jacket')

    await user().click(button)
    expect(button.querySelector('svg path')?.getAttribute('d')).toMatch(/^M5 12\.5/)

    await act(() => vi.advanceTimersByTimeAsync(ADDED_FEEDBACK_MS))
    expect(button.querySelector('svg path')?.getAttribute('d')).not.toMatch(/^M5 12\.5/)
    expect(button).toHaveAccessibleName('Agregar «Mens Cotton Jacket» al carrito')
  })

  it(`is disabled at the limit of ${MAX_QUANTITY} units`, () => {
    saveCart([{ productId: 3, quantity: MAX_QUANTITY }])
    renderCatalog()

    expect(quickAdd('Mens Cotton Jacket')).toBeDisabled()
    expect(quickAdd('Mens Casual Premium Slim Fit')).toBeEnabled()
  })

  it('needs the CartProvider (store and announcer)', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<QuickAddButton product={jacket} />)).toThrow(/inside <CartStoreProvider>/)
  })
})
