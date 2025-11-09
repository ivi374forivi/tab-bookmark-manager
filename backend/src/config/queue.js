const Queue = require('bull');
const logger = require('../utils/logger');
const { redisClient } = require('./redis');

let contentAnalysisQueue, archivalQueue, suggestionQueue;

if (process.env.NODE_ENV === 'test') {
  contentAnalysisQueue = { add: jest.fn(), process: jest.fn(), on: jest.fn(), close: jest.fn() };
  archivalQueue = { add: jest.fn(), process: jest.fn(), on: jest.fn(), close: jest.fn() };
  suggestionQueue = { add: jest.fn(), process: jest.fn(), on: jest.fn(), close: jest.fn() };
} else {
  // Create queues for different processing tasks
  contentAnalysisQueue = new Queue('content-analysis', {
    createClient: () => redisClient,
  });
  archivalQueue = new Queue('archival', {
    createClient: () => redisClient,
  });
  suggestionQueue = new Queue('suggestion', {
    createClient: () => redisClient,
  });
}


// Content analysis job processor
contentAnalysisQueue.process(async (job) => {
  logger.info(`Processing content analysis job ${job.id}`);
  const { itemId, itemType, url, content } = job.data;
  
  try {
    // Call ML service for analysis
    const axios = require('axios');
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    
    const response = await axios.post(`${ML_SERVICE_URL}/api/analyze`, {
      text: content,
      url: url
    });
    
    logger.info(`Content analysis completed for ${itemType} ${itemId}`);
    return response.data;
  } catch (error) {
    logger.error(`Content analysis failed for ${itemType} ${itemId}:`, error);
    throw error;
  }
});

// Archival job processor
archivalQueue.process(async (job) => {
  logger.info(`Processing archival job ${job.id}`);
  const { url } = job.data;
  
  try {
    const archiveService = require('../services/archiveService');
    const result = await archiveService.archivePage(url);
    logger.info(`Archival completed for ${url}`);
    return result;
  } catch (error) {
    logger.error(`Archival failed for ${url}:`, error);
    throw error;
  }
});

// Suggestion generation job processor
suggestionQueue.process(async (job) => {
  logger.info(`Processing suggestion job ${job.id}`);
  
  try {
    const suggestionService = require('../services/suggestionService');
    const result = await suggestionService.generateSuggestions();
    logger.info('Suggestion generation completed');
    return result;
  } catch (error) {
    logger.error('Suggestion generation failed:', error);
    throw error;
  }
});

module.exports = {
  contentAnalysisQueue,
  archivalQueue,
  suggestionQueue
};
