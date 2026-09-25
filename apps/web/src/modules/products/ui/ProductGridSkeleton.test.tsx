import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProductGridSkeleton } from './ProductGridSkeleton'

describe('ProductGridSkeleton', () => {
  it('announces loading once and hides the placeholders from assistive technology', () => {
    const { container } = render(<ProductGridSkeleton />)

    expect(screen.getByRole('status')).toHaveTextContent('Cargando productos')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(container.querySelectorAll('[data-card-media]')).toHaveLength(8)
  })
})
