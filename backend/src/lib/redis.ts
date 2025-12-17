import Redis from 'ioredis';

// Redis connection configuration
const getRedisConfig = () => {
  // Support multiple Redis providers
  if (process.env.REDIS_URL) {
    // For services like Upstash, Render, Railway that provide REDIS_URL
    return {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };
  }

  // For local development or custom Redis instances
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };
};

// Create Redis client
const createRedisClient = () => {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, getRedisConfig());
  }
  return new Redis(getRedisConfig());
};

// Global Redis client (similar to Prisma pattern)
const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis = globalForRedis.redis || createRedisClient();

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Redis connection event handlers
redis.on('connect', () => {
  console.log('🔌 Redis client connecting...');
});

redis.on('ready', () => {
  console.log('✅ Redis client connected and ready');
});

redis.on('error', (error) => {
  console.error('❌ Redis client error:', error);
  // Don't crash the app, just log the error
  // OTP will fail gracefully if Redis is down
});

redis.on('close', () => {
  console.log('🔌 Redis client connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis client reconnecting...');
});

// Helper function to check if Redis is available
export const isRedisAvailable = async (): Promise<boolean> => {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    return false;
  }
};

// Graceful shutdown
export const disconnectRedis = async (): Promise<void> => {
  try {
    await redis.quit();
    console.log('✅ Redis client disconnected gracefully');
  } catch (error) {
    console.error('❌ Error disconnecting Redis:', error);
  }
};

export default redis;

