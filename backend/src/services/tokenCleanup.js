const { pool } = require('../config/database');
const logger = require('../utils/logger');

const cleanupRevokedTokens = async () => {
  try {
    const result = await pool.query('DELETE FROM revoked_tokens WHERE expires_at < NOW()');
    logger.info(`Cleaned up ${result.rowCount} expired tokens`);
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
  }
};

module.exports = {
  cleanupRevokedTokens,
};
