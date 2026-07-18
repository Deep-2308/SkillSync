import { NextResponse } from "next/server";

/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Suitable for a single-process deployment or as a best-effort guard on
 * serverless (each warm lambda keeps its own window — for a hard guarantee
 * across instances, back this with Redis/Upstash; the call-site API here
 * would stay identical).
 *
 * Usage in a route handler:
 *   const limiter = rateLimiter({ limit: 10, window: 60 });
 *   export async function POST(req: Request) {
 *     const blocked = limiter.check(req);
 *     if (blocked) return blocked; // 429 with Retry-After
 *     ...
 *   }
 */

interface RateLimiterOptions {
  /** Max requests allowed per window. */
  limit: number;
  /** Window length in seconds. */
  window: number;
}

interface RateLimiter {
  /**
   * Returns a 429 NextResponse if the caller is over the limit, or null if
   * the request may proceed (and has been counted).
   */
  check(request: Request, key?: string): NextResponse | null;
}

/** Per-key request timestamps (ms). Sliding window = filter + push. */
type WindowStore = Map<string, number[]>;

// Survive dev hot-reloads the same way lib/mongodb.ts does; in production
// each server process simply keeps one store.
declare global {
  // eslint-disable-next-line no-var
  var _rateLimitStores: Map<string, WindowStore> | undefined;
}

const stores: Map<string, WindowStore> =
  globalThis._rateLimitStores ?? new Map();
globalThis._rateLimitStores = stores;

let storeSeq = 0;

/** Best-effort client identity: first hop of x-forwarded-for, else realip. */
export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function rateLimiter(options: RateLimiterOptions): RateLimiter {
  const { limit, window: windowSeconds } = options;
  const windowMs = windowSeconds * 1000;

  // Each limiter instance gets its own namespace so /api/search and
  // /api/auth/register don't share buckets.
  const storeKey = `limiter_${storeSeq++}_${limit}_${windowSeconds}`;
  const store: WindowStore = stores.get(storeKey) ?? new Map();
  stores.set(storeKey, store);

  return {
    check(request: Request, key?: string): NextResponse | null {
      const id = key ?? clientIp(request);
      const now = Date.now();

      // Drop timestamps that slid out of the window, then count.
      const hits = (store.get(id) ?? []).filter((t) => now - t < windowMs);

      if (hits.length >= limit) {
        // Retry-After = when the oldest in-window hit expires.
        const oldest = hits[0] ?? now;
        const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
        return NextResponse.json(
          { error: "Too many requests. Please slow down." },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfterSec),
              "X-RateLimit-Limit": String(limit),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }

      hits.push(now);
      store.set(id, hits);

      // Opportunistic cleanup: bound memory by evicting idle keys once the
      // store grows past ~1000 entries (cheap full sweep, rare).
      if (store.size > 1000) {
        for (const [k, v] of store) {
          if (v.every((t) => now - t >= windowMs)) store.delete(k);
        }
      }

      return null;
    },
  };
}
