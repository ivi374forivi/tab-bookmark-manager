require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');
const tabRoutes = require('./routes/tabs');
const bookmarkRoutes = require('./routes/bookmarks');
const searchRoutes = require('./routes/search');
const suggestionsRoutes = require('./routes/suggestions');
const archiveRoutes = require('./routes/archive');
const { initializeDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const automationEngine = require('./services/automationEngine');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Routes
app.use('/api/tabs', tabRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/archive', archiveRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Initialize services
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info('Database initialized');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected');

    // Start automation engine
    automationEngine.start();
    logger.info('Automation engine started');

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`Backend API server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  automationEngine.stop();
  process.exit(0);
});

module.exports = app;
