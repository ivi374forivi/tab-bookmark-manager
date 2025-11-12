const logger = require('../utils/logger');
const { isOperationalError } = require('../utils/errors');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error details
  const errorLog = {
    message: err.message,
    statusCode: err.statusCode || 500,
    method: req.method,
    url: req.url,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  };

  // Log stack trace for non-operational errors
  if (!isOperationalError(err)) {
    errorLog.stack = err.stack;
    logger.error('Unexpected error occurred', errorLog);
  } else {
    logger.warn('Operational error occurred', errorLog);
  }

  // Send error response
  const statusCode = err.statusCode || 500;
  const response = {
    status: 'error',
    message: err.message || 'Internal server error',
    timestamp: err.timestamp || new Date().toISOString(),
  };

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  // Include additional error details if available
  if (err.details) {
    response.details = err.details;
  }

  res.status(statusCode).json(response);
};

/**
 * Handle 404 errors
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = () => {
  process.on('uncaughtException', (error) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });
};

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', {
      reason,
      promise,
    });
    process.exit(1);
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  handleUncaughtException,
  handleUnhandledRejection,
};
