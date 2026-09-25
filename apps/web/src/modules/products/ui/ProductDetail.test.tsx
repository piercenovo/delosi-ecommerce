import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makeProduct } from '@/test/product-fixtures'
import { ProductDetail } from './ProductDetail'

const product = makeProduct({
  id: 5,
  title: 'John Hardy Women Legends Naga Bracelet',
  description: 'From our Legends Collection.',
  price: 695,
  rating: { rate: 4.6, count: 400 },
})

describe('ProductDetail', () => {
  it('titles the page with the product name', () => {
    render(<ProductDetail product={product} />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'John Hardy Women Legends Naga Bracelet' }),
    ).toBeVisible()
  })

  it('shows price, rating and description', () => {
    render(<ProductDetail product={product} />)

    expect(screen.getByText('USD 695.00', { normalizer: (text) => text })).toBeVisible()
    expect(screen.getByRole('img', { name: 'Valoración 4.6 de 5, 400 reseñas' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Descripción' })).toHaveTextContent(
      'From our Legends Collection.',
    )
  })

  it('preloads the main image: the only LCP candidate of the page', () => {
    render(<ProductDetail product={product} />)

    expect(screen.getByRole('img', { name: product.title })).toHaveAttribute('sizes')
    expect(document.head.querySelector('link[rel="preload"][as="image"]')).not.toBeNull()
  })

  it('renders the actions slot (add to cart) next to the price', () => {
    render(<ProductDetail product={product} actions={<button type="button">Agregar</button>} />)

    expect(screen.getByRole('button', { name: 'Agregar' })).toBeVisible()
  })
})
