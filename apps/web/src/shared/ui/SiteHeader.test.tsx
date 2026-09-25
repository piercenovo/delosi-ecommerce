import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SiteHeader } from './SiteHeader'

describe('SiteHeader', () => {
  it('is the banner landmark and links the brand to the catalog', () => {
    render(<SiteHeader />)

    expect(screen.getByRole('banner')).toContainElement(
      screen.getByRole('link', { name: 'Delosi Store' }),
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/products')
  })

  it('renders its actions slot inside the banner', () => {
    render(<SiteHeader actions={<a href="/cart">Carrito</a>} />)

    expect(screen.getByRole('banner')).toContainElement(
      screen.getByRole('link', { name: 'Carrito' }),
    )
  })
})
