const axios = require('axios');
const logger = require('./logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
const HEALTH_CHECK_INTERVAL = 60000; // 1 minute
const REQUEST_TIMEOUT = 30000; // 30 seconds

let mlServiceHealthy = true;
let lastHealthCheck = null;

/**
 * Check if ML service is healthy
 */
async function checkMLServiceHealth() {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 5000,
    });
    
    mlServiceHealthy = response.status === 200;
    lastHealthCheck = new Date();
    
    if (mlServiceHealthy) {
      logger.debug('ML Service health check passed', { timestamp: lastHealthCheck });
    }
    
    return mlServiceHealthy;
  } catch (error) {
    mlServiceHealthy = false;
    lastHealthCheck = new Date();
    logger.warn('ML Service health check failed', {
      error: error.message,
      timestamp: lastHealthCheck,
    });
    return false;
  }
}

/**
 * Start periodic health checks
 */
function startHealthChecks() {
  // Initial health check
  checkMLServiceHealth();
  
  // Periodic health checks
  setInterval(checkMLServiceHealth, HEALTH_CHECK_INTERVAL);
  
  logger.info('ML Service health monitoring started', {
    interval: HEALTH_CHECK_INTERVAL,
  });
}

/**
 * Get current ML service status
 */
function getMLServiceStatus() {
  return {
    healthy: mlServiceHealthy,
    lastCheck: lastHealthCheck,
  };
}

/**
 * Make a request to ML service with error handling and retries
 */
async function callMLService(endpoint, data, retries = 2) {
  const url = `${ML_SERVICE_URL}${endpoint}`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(url, data, {
        timeout: REQUEST_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Update health status on successful call
      mlServiceHealthy = true;
      
      return response.data;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        mlServiceHealthy = false;
        logger.error('ML Service connection failed', {
          endpoint,
          attempt: attempt + 1,
          error: error.message,
          code: error.code,
        });
      } else if (error.response) {
        // Server responded with error status
        logger.error('ML Service returned error', {
          endpoint,
          attempt: attempt + 1,
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.code === 'ECONNABORTED') {
        logger.error('ML Service request timeout', {
          endpoint,
          attempt: attempt + 1,
          timeout: REQUEST_TIMEOUT,
        });
      } else {
        logger.error('ML Service request failed', {
          endpoint,
          attempt: attempt + 1,
          error: error.message,
        });
      }
      
      if (isLastAttempt) {
        // Return null or throw based on configuration
        return null;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  return null;
}

/**
 * Wrapper functions for common ML service operations
 */
async function analyzeContent(content, url) {
  if (!mlServiceHealthy) {
    logger.warn('Skipping ML analysis - service unhealthy');
    return null;
  }
  
  return await callMLService('/api/analyze', { text: content, url });
}

async function generateEmbedding(text) {
  if (!mlServiceHealthy) {
    logger.warn('Skipping embedding generation - service unhealthy');
    return null;
  }
  
  return await callMLService('/api/embed', { text });
}

async function summarizeText(text) {
  if (!mlServiceHealthy) {
    logger.warn('Skipping text summarization - service unhealthy');
    return null;
  }
  
  return await callMLService('/api/summarize', { text });
}

module.exports = {
  checkMLServiceHealth,
  startHealthChecks,
  getMLServiceStatus,
  callMLService,
  analyzeContent,
  generateEmbedding,
  summarizeText,
};
