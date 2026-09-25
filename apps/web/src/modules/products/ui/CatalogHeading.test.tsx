import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CatalogHeading, CatalogHeadingSkeleton } from './CatalogHeading'

describe('CatalogHeading', () => {
  it('titles the page with the active category', () => {
    render(<CatalogHeading category={{ slug: 'jewelery', name: 'Joyería' }} count={4} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Joyería' })).toBeVisible()
  })

  it('falls back to the whole catalog without a category', () => {
    render(<CatalogHeading category={null} count={20} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Catálogo' })).toBeVisible()
  })

  it('announces the result count in a status region', () => {
    const { rerender } = render(<CatalogHeading category={null} count={20} />)
    expect(screen.getByRole('status')).toHaveTextContent('20 productos')

    rerender(<CatalogHeading category={null} count={1} />)
    expect(screen.getByRole('status')).toHaveTextContent('1 producto')
  })

  it('has a placeholder hidden from assistive technology', () => {
    const { container } = render(<CatalogHeadingSkeleton />)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })
})
