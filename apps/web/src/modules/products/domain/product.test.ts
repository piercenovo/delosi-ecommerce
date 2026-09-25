// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { parseProductId } from './product'

describe('parseProductId', () => {
  it.each([
    ['1', 1],
    ['20', 20],
    ['987654', 987654],
  ])('accepts the positive integer %j', (raw, id) => {
    expect(parseProductId(raw)).toBe(id)
  })

  it.each(['0', '-1', '1.5', 'abc', '1e3', ' 1', '1 ', '01', '', '0x10'])('rejects %j', (raw) => {
    expect(parseProductId(raw)).toBeNull()
  })

  it('rejects ids beyond the safe integer range', () => {
    expect(parseProductId('9007199254740993')).toBeNull()
  })
})
