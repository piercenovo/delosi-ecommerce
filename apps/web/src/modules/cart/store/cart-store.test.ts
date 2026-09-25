import { describe, expect, it } from 'vitest'
import { CART_STORAGE_KEY, CART_STORAGE_VERSION, createCartStore } from './cart-store'

const bracelet = { id: 5, title: 'Naga Bracelet', price: 695, image: '/images/products/5.png' }
const ring = { id: 7, title: 'Princess Ring', price: 9.99, image: '/images/products/7.png' }

function memory(initial?: unknown) {
  const data = new Map<string, string>()
  if (initial !== undefined) {
    data.set(CART_STORAGE_KEY, typeof initial === 'string' ? initial : JSON.stringify(initial))
  }
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  } as Storage
  return { storage, read: () => JSON.parse(data.get(CART_STORAGE_KEY) ?? 'null') as unknown }
}

const stored = (items: unknown[], version = CART_STORAGE_VERSION) => ({ state: { items }, version })
const line = {
  productId: 5,
  title: 'Naga Bracelet',
  price: 695,
  image: '/images/products/5.png',
  quantity: 2,
}

describe('createCartStore', () => {
  it('starts empty and not hydrated (hydration is triggered by the Provider)', () => {
    const store = createCartStore({ storage: memory(stored([line])).storage })

    expect(store.getState().items).toEqual([])
    expect(store.persist.hasHydrated()).toBe(false)
  })

  it('runs every action through the reducer', () => {
    const store = createCartStore({ storage: memory().storage })
    const { add, setQuantity, remove, clear } = store.getState()

    add(bracelet)
    add(bracelet, 2)
    add(ring)
    setQuantity(7, 4)
    expect(store.getState().items.map(({ productId, quantity }) => [productId, quantity])).toEqual([
      [5, 3],
      [7, 4],
    ])

    remove(5)
    expect(store.getState().items.map(({ productId }) => productId)).toEqual([7])

    clear()
    expect(store.getState().items).toEqual([])
  })

  it('does not notify subscribers when an action changes nothing', () => {
    const store = createCartStore({ storage: memory().storage })
    let notifications = 0
    store.subscribe(() => {
      notifications += 1
    })

    store.getState().remove(123)
    store.getState().clear()

    expect(notifications).toBe(0)
  })

  it('persists only the items, with the schema version', () => {
    const { storage, read } = memory()
    const store = createCartStore({ storage })

    store.getState().add(bracelet)

    expect(read()).toEqual({
      state: { items: [{ ...line, quantity: 1 }] },
      version: CART_STORAGE_VERSION,
    })
  })

  it('restores the saved cart on rehydrate', async () => {
    const store = createCartStore({ storage: memory(stored([line])).storage })

    await store.persist.rehydrate()

    expect(store.getState().items).toEqual([line])
    expect(store.persist.hasHydrated()).toBe(true)
  })

  it.each([
    ['corrupt JSON', '{"state": oops'],
    ['items that are not a list', stored('nope' as unknown as unknown[])],
    ['a quantity out of range', stored([{ ...line, quantity: 500 }])],
    ['a negative price', stored([{ ...line, price: -1 }])],
    ['an image on another host', stored([{ ...line, image: 'https://evil.example/x.png' }])],
    ['a state from an unknown older version', stored([line], 0)],
  ])('starts empty, but hydrated, from %s', async (_, saved) => {
    const store = createCartStore({ storage: memory(saved).storage })

    await store.persist.rehydrate()

    expect(store.getState().items).toEqual([])
    expect(store.persist.hasHydrated()).toBe(true)
  })

  it('keeps working in memory when storage throws', async () => {
    const throwing = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    } as unknown as Storage
    const store = createCartStore({ storage: throwing })

    await store.persist.rehydrate()
    store.getState().add(bracelet)

    expect(store.persist.hasHydrated()).toBe(true)
    expect(store.getState().items).toHaveLength(1)
  })
})
