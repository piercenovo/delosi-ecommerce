import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makeProduct } from '@/test/product-fixtures'
import { ProductGrid, PRIORITY_IMAGE_COUNT } from './ProductGrid'

const products = Array.from({ length: 6 }, (_, index) => makeProduct({ id: index + 1 }))

describe('ProductGrid', () => {
  it('renders one list item per product in a labelled list', () => {
    render(<ProductGrid products={products} />)

    const list = screen.getByRole('list', { name: 'Productos' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(6)
  })

  it('prioritizes only the images of the first row', () => {
    render(<ProductGrid products={products} />)

    const eager = screen
      .getAllByRole('img', { name: /^Product \d$/ })
      .filter((image) => image.getAttribute('fetchpriority') === 'high')
      .map((image) => image.getAttribute('alt'))

    expect(PRIORITY_IMAGE_COUNT).toBe(4)
    expect(eager).toEqual(['Product 1', 'Product 2', 'Product 3', 'Product 4'])
  })

  it('can skip priority images and nest card titles under a section heading', () => {
    render(
      <ProductGrid
        products={products}
        label="Productos relacionados"
        priorityCount={0}
        headingLevel="h3"
      />,
    )

    expect(screen.getByRole('list', { name: 'Productos relacionados' })).toBeVisible()
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6)
    expect(document.querySelector('img[fetchpriority="high"]')).toBeNull()
  })
})
