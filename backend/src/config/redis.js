const Redis = require('ioredis');
const RedisMock = require('ioredis-mock');
const logger = require('../utils/logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient;

if (process.env.NODE_ENV === 'test') {
  redisClient = new RedisMock();
} else {
  redisClient = new Redis(REDIS_URL);
}

redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

async function connectRedis() {
  // Connection is handled by ioredis automatically
  return redisClient;
}

module.exports = { redisClient, connectRedis, REDIS_URL };
