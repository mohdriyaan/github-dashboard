const DEFAULT_TTL_MS = 10 * 60 * 1000
const DEFAULT_MAX_ENTRIES = 100

const createTtlCache = ({
  ttlMs = DEFAULT_TTL_MS,
  maxEntries = DEFAULT_MAX_ENTRIES,
} = {}) => {
  const store = new Map()

  const removeExpired = () => {
    const now = Date.now()

    for (const [key, entry] of store) {
      if (entry.expiresAt <= now) {
        store.delete(key)
      }
    }
  }

  const get = (key) => {
    const entry = store.get(key)

    if (!entry) return null

    if (entry.expiresAt <= Date.now()) {
      store.delete(key)
      return null
    }

    return entry.value
  }

  const set = (key, value) => {
    removeExpired()

    if (store.has(key)) {
      store.delete(key)
    }

    while (store.size >= maxEntries) {
      const oldestKey = store.keys().next().value
      if (oldestKey === undefined) break
      store.delete(oldestKey)
    }

    store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    })
  }

  const clear = () => store.clear()

  return { get, set, clear }
}

export const profileCache = createTtlCache()
export const reposCache = createTtlCache()
export const contributionsCache = createTtlCache()
