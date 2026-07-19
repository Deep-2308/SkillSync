import { createCache } from "@/lib/cache";
import crypto from "crypto";

/**
 * Cache for AI generated results.
 * We want to cache deterministic results to avoid re-incurring API costs.
 */
const aiCacheStore = createCache<string>("ai_generations", 200);

export const aiCache = {
  get(key: string): string | undefined {
    return aiCacheStore.get(key);
  },
  
  set(key: string, value: string, ttlSeconds = 3600 * 24): void {
    aiCacheStore.set(key, value, ttlSeconds);
  },

  /**
   * Helper to generate a deterministic hash key from prompt components.
   */
  generateKey(systemPrompt: string, userContent: string, schemaName?: string): string {
    const hash = crypto.createHash("sha256");
    hash.update(systemPrompt);
    hash.update(userContent);
    if (schemaName) hash.update(schemaName);
    return hash.digest("hex");
  }
};
