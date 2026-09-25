import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProductDetailSkeleton } from './ProductDetailSkeleton'

describe('ProductDetailSkeleton', () => {
  it('announces loading once and hides the placeholders', () => {
    const { container } = render(<ProductDetailSkeleton />)

    expect(screen.getByRole('status')).toHaveTextContent('Cargando producto')
    expect(container.querySelector('[aria-hidden="true"] [data-skeleton]')).not.toBeNull()
  })
})
