// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { config, NOT_FOUND_PATH, proxy } from './proxy'

const request = (path: string) => new NextRequest(new URL(path, 'https://delosi-shop.vercel.app'))
const rewriteTarget = (path: string) => proxy(request(path))?.headers.get('x-middleware-rewrite')

describe('proxy', () => {
  it.each(['/products/abc', '/products/0', '/products/05', '/products/1.5', '/products/-1'])(
    'answers %s with a real 404 before rendering starts',
    (path) => {
      expect(rewriteTarget(path)).toBe(`https://delosi-shop.vercel.app${NOT_FOUND_PATH}`)
    },
  )

  it.each(['/products/1', '/products/20', '/products/999'])('lets %s through', (path) => {
    expect(proxy(request(path))).toBeUndefined()
  })

  it('only runs on product detail paths', () => {
    expect(config.matcher).toBe('/products/:id')
  })
})
