const Queue = require('bull');
const logger = require('../utils/logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create queues for different processing tasks
const contentAnalysisQueue = new Queue('content-analysis', REDIS_URL);
const archivalQueue = new Queue('archival', REDIS_URL);
const suggestionQueue = new Queue('suggestion', REDIS_URL);

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
