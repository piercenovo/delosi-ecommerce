// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { ProductNotFoundError } from './errors'

describe('ProductNotFoundError', () => {
  it('carries the id of the missing product', () => {
    const error = new ProductNotFoundError(42)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ProductNotFoundError')
    expect(error.productId).toBe(42)
    expect(error.message).toContain('42')
  })
})
