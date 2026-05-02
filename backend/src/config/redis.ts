import IORedis from "ioredis";
import { env } from "./env.js";

type RedisClient = IORedis.Redis;

let redis: RedisClient | null = null;

export const getRedis = (): RedisClient | null => {
  if (redis) return redis;
  if (!env.redisUrl) return null;

  try {
    const client = new IORedis.default(env.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 5) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    client.on("error", (err: Error) => {
      console.warn("[Redis] Connection error:", err.message);
    });

    client.connect().catch(() => {
      console.warn("[Redis] Could not connect — caching disabled");
      redis = null;
    });

    redis = client;
    return redis;
  } catch {
    console.warn("[Redis] Init failed — caching disabled");
    return null;
  }
};
