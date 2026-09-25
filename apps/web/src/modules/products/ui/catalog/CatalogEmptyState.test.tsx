import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CatalogEmptyState } from './CatalogEmptyState'

describe('CatalogEmptyState', () => {
  it('names the search and the category that returned nothing', () => {
    render(
      <CatalogEmptyState
        query={{ q: 'zapatillas', category: 'jewelery' }}
        category={{ slug: 'jewelery', name: 'Joyería' }}
      />,
    )

    expect(screen.getByRole('heading', { name: 'No encontramos productos' })).toBeVisible()
    expect(screen.getByText(/Nada coincide con «zapatillas» en Joyería/)).toBeVisible()
  })

  it('explains an empty category without a search', () => {
    render(
      <CatalogEmptyState
        query={{ category: 'jewelery' }}
        category={{ slug: 'jewelery', name: 'Joyería' }}
      />,
    )

    expect(screen.getByText('Por ahora no hay productos en Joyería.')).toBeVisible()
  })

  it('offers the way back to the full catalog', () => {
    render(<CatalogEmptyState query={{ q: 'x' }} category={null} />)

    expect(screen.getByRole('link', { name: 'Quitar filtros' })).toHaveAttribute(
      'href',
      '/products',
    )
  })
})
