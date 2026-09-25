// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { CATALOG_CACHE_TAGS, isCatalogCacheTag } from './cache-tags'

describe('CATALOG_CACHE_TAGS', () => {
  it('builds a tag per product', () => {
    expect(CATALOG_CACHE_TAGS.product(7)).toBe('product:7')
  })
})

describe('isCatalogCacheTag', () => {
  it.each(['products', 'categories', 'product:1', 'product:20'])('accepts %j', (tag) => {
    expect(isCatalogCacheTag(tag)).toBe(true)
  })

  it.each(['', 'users', 'product:', 'product:0', 'product:abc', 'product:01', 'products ', '*'])(
    'rejects %j',
    (tag) => {
      expect(isCatalogCacheTag(tag)).toBe(false)
    },
  )
})
