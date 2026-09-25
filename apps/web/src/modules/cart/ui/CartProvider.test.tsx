import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CartStoreProvider } from '../store/CartStoreProvider'
import { useCartAnnouncer } from './CartProvider'

function Announcer() {
  useCartAnnouncer()
  return null
}

describe('useCartAnnouncer', () => {
  it('fails loudly without CartProvider, even inside the store provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(
        <CartStoreProvider>
          <Announcer />
        </CartStoreProvider>,
      ),
    ).toThrow(/inside <CartProvider>/)
  })
})
