import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makeProduct } from '@/test/product-fixtures'
import { RelatedProducts } from './RelatedProducts'

describe('RelatedProducts', () => {
  it('is a section named by its heading, with the related products', () => {
    render(<RelatedProducts products={[makeProduct({ id: 1 }), makeProduct({ id: 2 })]} />)

    const section = screen.getByRole('region', { name: 'También te puede interesar' })
    expect(within(section).getAllByRole('listitem')).toHaveLength(2)
  })

  it('renders nothing without related products', () => {
    const { container } = render(<RelatedProducts products={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})
