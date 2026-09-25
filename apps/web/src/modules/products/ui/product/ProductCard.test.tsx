import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makeProduct } from '@/test/product-fixtures'
import { ProductCard } from './ProductCard'

const product = makeProduct({
  id: 9,
  title: 'WD 2TB Elements Portable External Hard Drive',
  price: 64,
  rating: { rate: 3.3, count: 203 },
})

describe('ProductCard', () => {
  it('links to the product detail, named by the product title', () => {
    render(<ProductCard product={product} />)

    expect(
      screen.getByRole('link', { name: 'WD 2TB Elements Portable External Hard Drive' }),
    ).toHaveAttribute('href', '/products/9')
  })

  it('shows the formatted price and the accessible rating', () => {
    render(<ProductCard product={product} />)

    // Match the raw text: the default normalizer would rewrite the non-breaking space.
    expect(screen.getByText('USD\u00a064.00', { normalizer: (text) => text })).toBeVisible()
    expect(screen.getByRole('img', { name: 'Valoración 3.3 de 5, 203 reseñas' })).toBeVisible()
  })

  it('describes the image with the product title', () => {
    render(<ProductCard product={product} />)

    expect(
      screen.getByRole('img', { name: 'WD 2TB Elements Portable External Hard Drive' }),
    ).toHaveAttribute('sizes', '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw')
  })

  it('lazy-loads the image unless it is a likely LCP candidate', () => {
    const { rerender } = render(<ProductCard product={product} />)
    const image = () => screen.getByRole('img', { name: product.title })

    expect(image()).toHaveAttribute('loading', 'lazy')
    expect(image()).not.toHaveAttribute('fetchpriority')

    rerender(<ProductCard product={product} highPriority />)

    expect(image()).toHaveAttribute('loading', 'eager')
    expect(image()).toHaveAttribute('fetchpriority', 'high')
  })

  it('renders an action next to the price, above the stretched link', () => {
    render(<ProductCard product={product} action={<button type="button">Agregar</button>} />)

    const action = screen.getByRole('button', { name: 'Agregar' })
    expect(screen.getByRole('article')).toContainElement(action)
    expect(action.parentElement?.className).toMatch(/action/)
  })
})
