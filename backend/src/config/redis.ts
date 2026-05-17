import IORedis from "ioredis";
import { env } from "./env.js";

type RedisClient = IORedis.Redis;

let redis: RedisClient | null = null;
let redisErrorLogged = false;

export const getRedis = (): RedisClient | null => {
  if (redis) return redis;
  if (!env.redisUrl) return null;

  try {
    const client = new IORedis.default(env.redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy(times: number) {
        if (times > 2) return null;  // give up after 2 retries
        return Math.min(times * 500, 2000);
      },
      lazyConnect: true,
    });

    client.on("error", () => {
      if (!redisErrorLogged) {
        console.warn("[Redis] Connection failed — caching disabled (suppressing further errors)");
        redisErrorLogged = true;
      }
      redis = null;
    });

    client.connect().catch(() => {
      if (!redisErrorLogged) {
        console.warn("[Redis] Could not connect — caching disabled");
        redisErrorLogged = true;
      }
      redis = null;
    });

    redis = client;
    return redis;
  } catch {
    console.warn("[Redis] Init failed — caching disabled");
    return null;
  }
};
