// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { isAllowedProductImage, REMOTE_PRODUCT_IMAGES } from './product-images'

describe('isAllowedProductImage', () => {
  it.each([
    ['a local image', '/images/products/5.png'],
    ['a FakeStore image', 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png'],
  ])('accepts %s', (_, src) => {
    expect(isAllowedProductImage(src)).toBe(true)
  })

  it.each([
    ['another host', 'https://evil.example/img/x.png'],
    ['a protocol-relative URL', '//evil.example/x.png'],
    ['plain http', 'http://fakestoreapi.com/img/x.png'],
    ['another path on FakeStore', 'https://fakestoreapi.com/products/1'],
    ['a path that escapes /img/', 'https://fakestoreapi.com/img/../products/1'],
    ['credentials that hide another host', 'https://fakestoreapi.com@evil.example/img/x.png'],
    ['another port', 'https://fakestoreapi.com:8443/img/x.png'],
    ['a relative path', 'images/x.png'],
    ['an empty string', ''],
  ])('rejects %s', (_, src) => {
    expect(isAllowedProductImage(src)).toBe(false)
  })
})

describe('REMOTE_PRODUCT_IMAGES', () => {
  it('is the pattern next.config allows for next/image', () => {
    expect(REMOTE_PRODUCT_IMAGES).toEqual({
      protocol: 'https',
      hostname: 'fakestoreapi.com',
      pathname: '/img/**',
    })
  })
})
