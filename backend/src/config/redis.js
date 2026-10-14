const Redis = require('ioredis');

let client = null;
let isRedisConnected = false;

const isRedisEnabled = process.env.ENABLE_REDIS === 'true';

if (isRedisEnabled) {
  try {
    client = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('[Redis] Connection attempts exhausted. Running in degraded cache-bypass mode.');
          return null; // Stop retrying
        }
        return Math.min(times * 100, 2000);
      },
    });

    client.on('connect', () => {
      isRedisConnected = true;
      console.log('[Redis] Connected successfully to cache server');
    });

    client.on('error', (err) => {
      isRedisConnected = false;
      console.warn(`[Redis Notice] Cache unavailable (${err.message}). Bypassing Redis cache.`);
    });

    // Initiate connection asynchronously
    client.connect().catch((err) => {
      console.warn(`[Redis Notice] Initial connect failed (${err.message}). Running without cache.`);
    });
  } catch (err) {
    console.warn(`[Redis Notice] Failed to initialize Redis client (${err.message}).`);
  }
} else {
  console.log('[Redis Notice] Redis caching is disabled via ENABLE_REDIS flag.');
}

/**
 * Safe Redis Cache Helpers (No-Op when Redis is disabled or offline)
 */
const cache = {
  isAvailable: () => isRedisConnected && client !== null,

  async get(key) {
    if (!cache.isAvailable()) return null;
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn(`[Redis Get Error] ${err.message}`);
      return null;
    }
  },

  async set(key, value, ttlSeconds = 60) {
    if (!cache.isAvailable()) return false;
    try {
      await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return true;
    } catch (err) {
      console.warn(`[Redis Set Error] ${err.message}`);
      return false;
    }
  },

  async del(key) {
    if (!cache.isAvailable()) return false;
    try {
      await client.del(key);
      return true;
    } catch (err) {
      console.warn(`[Redis Del Error] ${err.message}`);
      return false;
    }
  },

  async flushPattern(pattern) {
    if (!cache.isAvailable()) return false;
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
      return true;
    } catch (err) {
      console.warn(`[Redis Flush Pattern Error] ${err.message}`);
      return false;
    }
  },

  async disconnect() {
    if (client) {
      try {
        await client.quit();
      } catch (err) {
        // Ignore disconnect errors on shutdown
      }
    }
  },
};

module.exports = cache;
