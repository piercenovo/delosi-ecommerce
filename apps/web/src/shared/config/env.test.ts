// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { parseServerEnv } from './env'

describe('parseServerEnv', () => {
  it('applies defaults when variables are missing', () => {
    expect(parseServerEnv({})).toEqual({
      PRODUCTS_API_BASE_URL: 'https://fakestoreapi.com',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      CATALOG_SNAPSHOT_FALLBACK: 'on',
      PRODUCT_IMAGES: 'local',
    })
  })

  it('removes trailing slashes from URLs', () => {
    const env = parseServerEnv({
      PRODUCTS_API_BASE_URL: 'http://localhost:4010/',
      NEXT_PUBLIC_SITE_URL: 'https://shop.example.com//',
    })

    expect(env.PRODUCTS_API_BASE_URL).toBe('http://localhost:4010')
    expect(env.NEXT_PUBLIC_SITE_URL).toBe('https://shop.example.com')
  })

  it('throws a readable error that names the invalid variable', () => {
    expect(() => parseServerEnv({ PRODUCTS_API_BASE_URL: 'not-a-url' })).toThrow(
      /PRODUCTS_API_BASE_URL/,
    )
  })

  it('rejects a revalidate secret shorter than 16 characters', () => {
    expect(() => parseServerEnv({ REVALIDATE_SECRET: 'short' })).toThrow(/REVALIDATE_SECRET/)
  })

  it('accepts a valid revalidate secret', () => {
    const env = parseServerEnv({ REVALIDATE_SECRET: 'a-very-long-secret-value' })

    expect(env.REVALIDATE_SECRET).toBe('a-very-long-secret-value')
  })

  it('lets tests turn the snapshot fallback off, and nothing else', () => {
    expect(parseServerEnv({ CATALOG_SNAPSHOT_FALLBACK: 'off' }).CATALOG_SNAPSHOT_FALLBACK).toBe(
      'off',
    )
    expect(() => parseServerEnv({ CATALOG_SNAPSHOT_FALLBACK: 'false' })).toThrow(
      /CATALOG_SNAPSHOT_FALLBACK/,
    )
  })

  it('serves product images from FakeStore only when asked, and accepts nothing else', () => {
    expect(parseServerEnv({ PRODUCT_IMAGES: 'remote' }).PRODUCT_IMAGES).toBe('remote')
    expect(() => parseServerEnv({ PRODUCT_IMAGES: 'cdn' })).toThrow(/PRODUCT_IMAGES/)
  })
})
