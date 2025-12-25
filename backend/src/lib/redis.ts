import Redis from 'ioredis';

// Clean Redis URL (remove extra characters like --tls -u that might be copied from examples)
const cleanRedisUrl = (url: string): string => {
  // Remove URL-encoded command-line flags that might have been accidentally included
  let cleaned = url.trim();
  
  // Remove common command-line prefixes that might have been copied
  cleaned = cleaned.replace(/^.*?redis[s]?:\/\//, (match) => {
    // Find the redis:// or rediss:// part and keep it
    const redisMatch = match.match(/redis[s]?:\/\//);
    return redisMatch ? redisMatch[0] : match;
  });
  
  // Remove any trailing command-line arguments
  cleaned = cleaned.split(' ')[0];
  cleaned = cleaned.split('\n')[0];
  cleaned = cleaned.split('\r')[0];
  
  return cleaned;
};

// Redis connection configuration
const getRedisConfig = (url?: string) => {
  const config: any = {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };

  // For Upstash (rediss://) or other TLS connections, ioredis handles TLS automatically
  // No additional TLS config needed when using rediss:// protocol
  if (url && url.startsWith('rediss://')) {
    // TLS is handled automatically by ioredis when using rediss://
    config.tls = {};
  }

  return config;
};

// Create Redis client
const createRedisClient = () => {
  if (process.env.REDIS_URL) {
    const cleanedUrl = cleanRedisUrl(process.env.REDIS_URL);
    console.log('🔌 Connecting to Redis with REDIS_URL...');
    console.log('🔌 Redis URL:', cleanedUrl.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
    
    // Validate URL format
    if (!cleanedUrl.match(/^redis[s]?:\/\//)) {
      console.error('❌ Invalid REDIS_URL format. Should start with redis:// or rediss://');
      console.error('   Current value:', cleanedUrl.substring(0, 50) + '...');
      console.error('   Example: rediss://default:password@host:6379');
      throw new Error('Invalid REDIS_URL format');
    }
    
    const config = getRedisConfig(cleanedUrl);
    return new Redis(cleanedUrl, config);
  }
  
  // Fallback to local Redis (for development only)
  console.warn('⚠️ REDIS_URL not set, falling back to local Redis (localhost:6379)');
  console.warn('⚠️ This will fail if Redis is not running locally');
  console.warn('⚠️ Set REDIS_URL environment variable for production');
  
  return new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
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

