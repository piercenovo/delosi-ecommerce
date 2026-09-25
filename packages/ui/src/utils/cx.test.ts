import { describe, expect, it } from 'vitest'
import { cx } from './cx'

describe('cx', () => {
  it('joins class names with a single space', () => {
    expect(cx('button', 'primary')).toBe('button primary')
  })

  it('ignores falsy values', () => {
    expect(cx('button', false, undefined, null, '', 'md')).toBe('button md')
  })

  it('returns an empty string when nothing is truthy', () => {
    expect(cx(false, undefined)).toBe('')
  })
})
