import { describe, expect, it, vi } from 'vitest'
import { createSafeJsonStorage } from './safe-storage'

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial))
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    key: (index) => [...data.keys()][index] ?? null,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

const value = { state: { items: [] }, version: 1 }

describe('createSafeJsonStorage', () => {
  it('round-trips JSON values', () => {
    const backing = memoryStorage()
    const storage = createSafeJsonStorage(() => backing)

    storage.setItem('cart', value)

    expect(storage.getItem('cart')).toEqual(value)
  })

  it('reads a missing key as null', () => {
    expect(createSafeJsonStorage(() => memoryStorage()).getItem('cart')).toBeNull()
  })

  it('reads corrupt JSON as null instead of throwing', () => {
    const storage = createSafeJsonStorage(() => memoryStorage({ cart: '{not json' }))

    expect(storage.getItem('cart')).toBeNull()
  })

  it('never throws when storage is unavailable (private mode, blocked, server)', () => {
    const blocked = createSafeJsonStorage(() => {
      throw new DOMException('Access denied', 'SecurityError')
    })

    expect(() => blocked.setItem('cart', value)).not.toThrow()
    expect(blocked.getItem('cart')).toBeNull()
    expect(() => blocked.removeItem('cart')).not.toThrow()
  })

  it('never throws when the quota is exceeded', () => {
    const full = memoryStorage()
    full.setItem = vi.fn(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })

    expect(() => createSafeJsonStorage(() => full).setItem('cart', value)).not.toThrow()
  })

  it('removes keys', () => {
    const backing = memoryStorage({ cart: JSON.stringify(value) })

    createSafeJsonStorage(() => backing).removeItem('cart')

    expect(backing.getItem('cart')).toBeNull()
  })
})
