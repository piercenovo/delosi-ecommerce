import type { PersistStorage, StorageValue } from 'zustand/middleware'

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/**
 * JSON storage for `persist` that never throws. It matters: if reading throws (corrupt JSON,
 * storage blocked in private mode, no `window` on the server), `persist` never marks the
 * store as hydrated and the cart UI would wait forever. Failures read as "no saved cart"
 * and writes are skipped; the cart keeps working in memory.
 */
export function createSafeJsonStorage<S>(getStorage: () => KeyValueStorage): PersistStorage<S> {
  return {
    getItem(name) {
      try {
        const raw = getStorage().getItem(name)
        return raw === null ? null : (JSON.parse(raw) as StorageValue<S>)
      } catch {
        return null
      }
    },
    setItem(name, value) {
      try {
        getStorage().setItem(name, JSON.stringify(value))
      } catch {
        // Quota exceeded or storage blocked: keep the in-memory cart.
      }
    },
    removeItem(name) {
      try {
        getStorage().removeItem(name)
      } catch {
        // Same as above.
      }
    },
  }
}
