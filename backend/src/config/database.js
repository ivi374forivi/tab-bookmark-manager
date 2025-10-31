const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tab_bookmark_manager',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Initialize database schema
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tabs (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT,
        favicon TEXT,
        content TEXT,
        summary TEXT,
        category TEXT,
        tags TEXT[],
        entities JSONB,
        embedding vector(384),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_accessed TIMESTAMP,
        access_count INTEGER DEFAULT 0,
        is_archived BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT,
        favicon TEXT,
        folder TEXT,
        content TEXT,
        summary TEXT,
        category TEXT,
        tags TEXT[],
        entities JSONB,
        embedding vector(384),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_archived BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS archived_pages (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        html_content TEXT,
        screenshot_path TEXT,
        pdf_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS suggestions (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        item_ids INTEGER[],
        reason TEXT,
        confidence FLOAT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_tabs_url ON tabs(url);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_url ON bookmarks(url);
      CREATE INDEX IF NOT EXISTS idx_tabs_category ON tabs(category);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category);
      CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
    `);
    logger.info('Database schema initialized successfully');
  } catch (err) {
    logger.error('Error initializing database schema:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, initializeDatabase };
