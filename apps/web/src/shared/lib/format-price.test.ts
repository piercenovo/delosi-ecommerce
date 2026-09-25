import { describe, expect, it } from 'vitest'
import { formatPrice } from './format-price'

// es-PE separates the currency code with a non-breaking space, so a price never wraps.
const NBSP = '\u00a0'

describe('formatPrice', () => {
  it('formats US dollars with the Peruvian locale (currency code prefix)', () => {
    expect(formatPrice(64)).toBe(`USD${NBSP}64.00`)
  })

  it('always shows two decimals, rounding half-cents', () => {
    expect(formatPrice(9.9)).toBe(`USD${NBSP}9.90`)
    expect(formatPrice(109.955)).toBe(`USD${NBSP}109.96`)
  })

  it('groups thousands', () => {
    expect(formatPrice(1234.5)).toBe(`USD${NBSP}1,234.50`)
  })
})
