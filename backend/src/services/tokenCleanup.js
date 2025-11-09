const db = require('../config/db');
const logger = require('../utils/logger');

const cleanupRevokedTokens = async () => {
  try {
    const result = await db.run('DELETE FROM revoked_tokens WHERE expires_at < CURRENT_TIMESTAMP');
    logger.info(`Cleaned up ${result.rowCount} expired tokens`);
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
  }
};

module.exports = {
  cleanupRevokedTokens,
};
