// @vitest-environment node
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { mswServer, setupMswServer } from '@/test/msw-server'
import { CatalogUnavailableError } from '../domain/errors'
import { createFakeStoreClient, UpstreamHttpError } from './fakestore-client'
import { FakeStoreProductRepository } from './fakestore-product-repository'
import type { ProductDto } from './fakestore-schemas'

const BASE_URL = 'https://fakestore.test'

const ringDto: ProductDto = {
  id: 5,
  title: 'Silver Dragon Station Chain Bracelet',
  price: 695,
  description: 'From our Legends Collection.',
  category: 'jewelery',
  image: 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_t.png',
  rating: { rate: 4.6, count: 400 },
}

const repository = new FakeStoreProductRepository(
  createFakeStoreClient({ baseUrl: BASE_URL, timeoutMs: 50, retryDelayMs: 0 }),
  { '5': '/images/products/5.png' },
)

setupMswServer()

function respondWith(path: string, response: () => Response) {
  mswServer.use(http.get(`${BASE_URL}${path}`, response))
}

describe('FakeStoreProductRepository', () => {
  it('reads, validates and maps every product', async () => {
    respondWith('/products', () => HttpResponse.json([ringDto]))

    await expect(repository.findAll()).resolves.toEqual([
      {
        id: 5,
        title: 'Silver Dragon Station Chain Bracelet',
        price: 695,
        description: 'From our Legends Collection.',
        categorySlug: 'jewelery',
        image: '/images/products/5.png',
        rating: { rate: 4.6, count: 400 },
      },
    ])
  })

  it('rejects with CatalogUnavailableError when the payload does not match the schema', async () => {
    respondWith('/products', () => HttpResponse.json([{ id: 'not-a-number' }]))

    await expect(repository.findAll()).rejects.toBeInstanceOf(CatalogUnavailableError)
  })

  it('rejects with CatalogUnavailableError when the list body is empty', async () => {
    respondWith('/products', () => new HttpResponse(null, { status: 200 }))

    await expect(repository.findAll()).rejects.toBeInstanceOf(CatalogUnavailableError)
  })

  it('wraps upstream failures such as a Cloudflare 403, keeping the cause', async () => {
    respondWith('/products', () => new HttpResponse('Forbidden', { status: 403 }))

    const error = await repository.findAll().catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(CatalogUnavailableError)
    expect((error as CatalogUnavailableError).cause).toBeInstanceOf(UpstreamHttpError)
  })

  it('finds a product by id', async () => {
    respondWith('/products/5', () => HttpResponse.json(ringDto))

    await expect(repository.findById(5)).resolves.toMatchObject({ id: 5, categorySlug: 'jewelery' })
  })

  it('resolves to null for an unknown id (FakeStore answers 200 with an empty body)', async () => {
    respondWith('/products/999', () => new HttpResponse(null, { status: 200 }))

    await expect(repository.findById(999)).resolves.toBeNull()
  })

  it('reads and maps the categories', async () => {
    respondWith('/products/categories', () => HttpResponse.json(['electronics', "men's clothing"]))

    await expect(repository.findCategories()).resolves.toEqual([
      { slug: 'electronics', name: 'Electrónica' },
      { slug: 'mens-clothing', name: 'Ropa de hombre' },
    ])
  })
})
