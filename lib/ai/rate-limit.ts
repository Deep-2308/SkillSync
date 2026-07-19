import { rateLimiter } from "@/lib/rate-limit";

/**
 * Global rate limiter for all AI calls.
 * Implements a strict cap to prevent abuse and runaway cost.
 * E.g., 20 calls per window (1 hour = 3600s).
 */
export const aiRateLimiter = rateLimiter({
  limit: 20,
  window: 3600,
});
