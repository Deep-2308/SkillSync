/**
 * Tiny in-memory TTL + LRU cache for API responses.
 *
 * Used by GET /api/search to cache result payloads for 60s. Next.js fetch
 * caching doesn't apply here (we query Mongo directly, not via fetch), so we
 * keep a bounded LRU: expired entries are dropped on read, and when the cache
 * exceeds `maxEntries` the least-recently-used entry is evicted.
 *
 * Same caveat as lib/rate-limit.ts: per-process on serverless. That's fine for
 * a cache (worst case: a cold lambda recomputes once).
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var _lruCaches: Map<string, Map<string, CacheEntry<unknown>>> | undefined;
}

const caches: Map<string, Map<string, CacheEntry<unknown>>> =
  globalThis._lruCaches ?? new Map();
globalThis._lruCaches = caches;

export function createCache<T>(name: string, maxEntries = 200) {
  const store = (caches.get(name) ?? new Map()) as Map<string, CacheEntry<T>>;
  caches.set(name, store as Map<string, CacheEntry<unknown>>);

  return {
    get(key: string): T | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
      }
      // LRU touch: re-insert so Map iteration order reflects recency.
      store.delete(key);
      store.set(key, entry);
      return entry.value;
    },

    set(key: string, value: T, ttlSeconds: number): void {
      if (store.size >= maxEntries) {
        // Map iterates in insertion order → first key is least recently used.
        const lru = store.keys().next().value;
        if (lru !== undefined) store.delete(lru);
      }
      store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    },
  };
}
