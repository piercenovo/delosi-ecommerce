import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Breadcrumbs } from './Breadcrumbs'

const items = [
  { label: 'Catálogo', href: '/products' },
  { label: 'Joyería', href: '/products?category=jewelery' },
  { label: 'Naga Bracelet' },
]

describe('Breadcrumbs', () => {
  it('is a labelled navigation with an ordered trail', () => {
    render(<Breadcrumbs items={items} />)

    const nav = screen.getByRole('navigation', { name: 'Ruta de navegación' })
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3)
    expect(within(nav).getByRole('link', { name: 'Joyería' })).toHaveAttribute(
      'href',
      '/products?category=jewelery',
    )
  })

  it('marks the last item as the current page, without a link', () => {
    render(<Breadcrumbs items={items} />)

    const current = screen.getByText('Naga Bracelet')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current.closest('a')).toBeNull()
  })
})
