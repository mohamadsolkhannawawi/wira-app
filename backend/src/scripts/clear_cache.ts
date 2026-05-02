import { getRedis } from '../config/redis.js';

async function main() {
  try {
    const redis = getRedis();
    if (redis) {
      await redis.flushdb();
      console.log('Redis database flushed successfully');
    } else {
      console.log('Redis not connected, nothing to flush');
    }
  } catch (err) {
    console.error('Failed to flush redis:', err);
  } finally {
    process.exit(0);
  }
}

main();
