// @vitest-environment node
import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import snapshotJson from './snapshot/fakestore-snapshot.json'
import { SnapshotProductRepository } from './snapshot-product-repository'

const PUBLIC_DIR = path.resolve(import.meta.dirname, '../../../../public')
const repository = SnapshotProductRepository.fromJson(snapshotJson)

describe('SnapshotProductRepository (versioned FakeStore snapshot)', () => {
  it('serves every product of the captured catalog', async () => {
    const products = await repository.findAll()

    expect(products).toHaveLength(20)
    expect(new Set(products.map((product) => product.id)).size).toBe(20)
  })

  it('serves every image from the local public directory', async () => {
    const products = await repository.findAll()

    for (const product of products) {
      expect(product.image).toMatch(/^\/images\/products\//)
      expect(existsSync(path.join(PUBLIC_DIR, product.image))).toBe(true)
    }
  })

  it('finds a product by id and resolves to null for unknown ids', async () => {
    await expect(repository.findById(1)).resolves.toMatchObject({
      id: 1,
      categorySlug: 'mens-clothing',
    })
    await expect(repository.findById(999)).resolves.toBeNull()
  })

  it('serves the four categories', async () => {
    await expect(repository.findCategories()).resolves.toEqual([
      { slug: 'electronics', name: 'Electrónica' },
      { slug: 'jewelery', name: 'Joyería' },
      { slug: 'mens-clothing', name: 'Ropa de hombre' },
      { slug: 'womens-clothing', name: 'Ropa de mujer' },
    ])
  })

  it('rejects a snapshot that does not match the schema', () => {
    expect(() => SnapshotProductRepository.fromJson({ products: 'oops' })).toThrow()
  })
})
