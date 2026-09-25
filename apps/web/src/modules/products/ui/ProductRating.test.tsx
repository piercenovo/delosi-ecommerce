import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProductRating } from './ProductRating'

describe('ProductRating', () => {
  it('gives screen readers the full rating in words', () => {
    render(<ProductRating rating={{ rate: 4.1, count: 259 }} />)

    expect(screen.getByRole('img', { name: 'Valoración 4.1 de 5, 259 reseñas' })).toBeVisible()
  })

  it('uses the singular for a single review and keeps one decimal', () => {
    render(<ProductRating rating={{ rate: 3, count: 1 }} />)

    expect(screen.getByRole('img', { name: 'Valoración 3.0 de 5, 1 reseña' })).toBeVisible()
  })

  it('shows a compact rating to sighted users', () => {
    render(<ProductRating rating={{ rate: 4.1, count: 259 }} />)

    expect(screen.getByRole('img')).toHaveTextContent('4.1(259)')
  })
})
