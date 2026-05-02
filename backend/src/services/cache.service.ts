import { getRedis } from "../config/redis.js";

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    const redis = getRedis();
    if (!redis) return null;
    try {
      const raw = await redis.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async set(key: string, data: unknown, ttlSeconds: number): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
    } catch {
      /* cache write failure is non-critical */
    }
  },

  async del(key: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    try {
      await redis.del(key);
    } catch {
      /* best-effort */
    }
  },
};

// TTL constants (seconds)
export const TTL = {
  ANALYSIS: 86400,       // 24 hours
  LOCATION: 604800,      // 7 days
  LOCATION_LIST: 3600,   // 1 hour
} as const;
