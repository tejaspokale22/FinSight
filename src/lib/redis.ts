import { Redis } from '@upstash/redis';

// Get Redis configuration from environment variables
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Create Redis client only if credentials are available
export const redis = redisUrl && redisToken
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null;

// Helper function to check if Redis is available
export const isRedisAvailable = () => {
  if (!redis) {
    console.warn('Redis is not configured. Please check your environment variables.');
    return false;
  }
  return true;
}; 