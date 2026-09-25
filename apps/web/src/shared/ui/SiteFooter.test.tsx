import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SiteFooter } from './SiteFooter'

describe('SiteFooter', () => {
  it('is the contentinfo landmark with the store name and the demo note', () => {
    render(<SiteFooter />)

    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent('Delosi Store')
    expect(footer).toHaveTextContent('Delosi Store es un proyecto de reto técnico.')
  })

  it('credits the data source with a link', () => {
    render(<SiteFooter />)

    expect(screen.getByRole('link', { name: 'Fake Store API' })).toHaveAttribute(
      'href',
      'https://fakestoreapi.com',
    )
  })

  it('does not repeat the header link to the catalog', () => {
    render(<SiteFooter />)

    expect(screen.getAllByRole('link')).toHaveLength(1)
  })
})
