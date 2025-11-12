const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'tab-bookmark-manager' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      )
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

/**
 * Create a child logger with additional context
 */
logger.withContext = (context) => {
  return logger.child(context);
};

/**
 * Log HTTP request details
 */
logger.logRequest = (req, additionalInfo = {}) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    ...additionalInfo,
  });
};

/**
 * Log HTTP response details
 */
logger.logResponse = (req, res, responseTime, additionalInfo = {}) => {
  logger.info('HTTP Response', {
    method: req.method,
    url: req.url,
    userId: req.user?.id,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ...additionalInfo,
  });
};

module.exports = logger;
