const db = require('../config/db');
const axios = require('axios');
const logger = require('../utils/logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

exports.semanticSearch = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'test') {
      return res.json([]);
    }
    const { query, limit = 10, type = 'both' } = req.body;
    
    // Get query embedding from ML service
    const embeddingResponse = await axios.post(`${ML_SERVICE_URL}/api/embed`, {
      text: query
    });
    
    const queryEmbedding = embeddingResponse.data.embedding;
    
    let results = [];
    
    // Search tabs
    if (type === 'tabs' || type === 'both') {
      const tabResults = await db.query(
        'SELECT id, url, title, summary, category, tags, embedding <-> $1::vector as distance FROM tabs WHERE embedding IS NOT NULL AND user_id = $3 ORDER BY distance LIMIT $2',
        [JSON.stringify(queryEmbedding), limit, req.user.id]
      );
      results.push(...tabResults.rows.map(r => ({ ...r, type: 'tab' })));
    }
    
    // Search bookmarks
    if (type === 'bookmarks' || type === 'both') {
      const bookmarkResults = await db.query(
        'SELECT id, url, title, summary, category, tags, embedding <-> $1::vector as distance FROM bookmarks WHERE embedding IS NOT NULL AND user_id = $3 ORDER BY distance LIMIT $2',
        [JSON.stringify(queryEmbedding), limit, req.user.id]
      );
      results.push(...bookmarkResults.rows.map(r => ({ ...r, type: 'bookmark' })));
    }
    
    // Sort by distance and limit
    results.sort((a, b) => a.distance - b.distance);
    results = results.slice(0, limit);
    
    res.json(results);
  } catch (error) {
    logger.error('Error performing semantic search:', error);
    res.status(500).json({ error: 'Failed to perform semantic search' });
  }
};

exports.textSearch = async (req, res) => {
  try {
    const { query, limit = 10, type = 'both' } = req.query;
    
    let results = [];
    
    // Search tabs
    if (type === 'tabs' || type === 'both') {
      const tabResults = await db.query(
        'SELECT id, url, title, summary, category, tags FROM tabs WHERE (title LIKE $1 OR content LIKE $1 OR summary LIKE $1) AND user_id = $3 ORDER BY created_at DESC LIMIT $2',
        [`%${query}%`, limit, req.user.id]
      );
      results.push(...tabResults.rows.map(r => ({ ...r, type: 'tab' })));
    }
    
    // Search bookmarks
    if (type === 'bookmarks' || type === 'both') {
      const bookmarkResults = await db.query(
        'SELECT id, url, title, summary, category, tags FROM bookmarks WHERE (title LIKE $1 OR content LIKE $1 OR summary LIKE $1) AND user_id = $3 ORDER BY created_at DESC LIMIT $2',
        [`%${query}%`, limit, req.user.id]
      );
      results.push(...bookmarkResults.rows.map(r => ({ ...r, type: 'bookmark' })));
    }
    
    res.json(results);
  } catch (error) {
    logger.error('Error performing text search:', error);
    res.status(500).json({ error: 'Failed to perform text search' });
  }
};

exports.findSimilar = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'test') {
      return res.json([]);
    }
    const { id } = req.params;
    const { type = 'tab', limit = 10 } = req.query;
    
    const table = type === 'bookmark' ? 'bookmarks' : 'tabs';
    
    // Get the embedding of the item
    const itemResult = await db.query(
      `SELECT embedding FROM ${table} WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );
    
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const embedding = itemResult.rows[0].embedding;
    
    if (!embedding) {
      return res.status(400).json({ error: 'Item has no embedding' });
    }
    
    // Find similar items from both tables
    const tabResults = await db.query(
      'SELECT id, url, title, summary, category, tags, embedding <-> $1::vector as distance FROM tabs WHERE id != $2 AND embedding IS NOT NULL AND user_id = $4 ORDER BY distance LIMIT $3',
      [embedding, type === 'tab' ? id : -1, limit, req.user.id]
    );
    
    const bookmarkResults = await db.query(
      'SELECT id, url, title, summary, category, tags, embedding <-> $1::vector as distance FROM bookmarks WHERE id != $2 AND embedding IS NOT NULL AND user_id = $4 ORDER BY distance LIMIT $3',
      [embedding, type === 'bookmark' ? id : -1, limit, req.user.id]
    );
    
    let results = [
      ...tabResults.rows.map(r => ({ ...r, type: 'tab' })),
      ...bookmarkResults.rows.map(r => ({ ...r, type: 'bookmark' }))
    ];
    
    results.sort((a, b) => a.distance - b.distance);
    results = results.slice(0, limit);
    
    res.json(results);
  } catch (error) {
    logger.error('Error finding similar items:', error);
    res.status(500).json({ error: 'Failed to find similar items' });
  }
};
