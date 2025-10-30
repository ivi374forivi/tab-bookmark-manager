const { pool } = require('../config/database');
const { suggestionQueue } = require('../config/queue');
const logger = require('../utils/logger');

exports.getAllSuggestions = async (req, res) => {
  try {
    const { status = 'pending', limit = 50 } = req.query;
    
    const result = await pool.query(
      'SELECT * FROM suggestions WHERE status = $1 ORDER BY created_at DESC LIMIT $2',
      [status, limit]
    );
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};

exports.getDuplicates = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM suggestions WHERE type = $1 AND status = $2 ORDER BY confidence DESC',
      ['duplicate', 'pending']
    );
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching duplicates:', error);
    res.status(500).json({ error: 'Failed to fetch duplicates' });
  }
};

exports.getStaleTabs = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM suggestions WHERE type = $1 AND status = $2 ORDER BY created_at DESC',
      ['stale', 'pending']
    );
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching stale tabs:', error);
    res.status(500).json({ error: 'Failed to fetch stale tabs' });
  }
};

exports.getRelatedContent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM suggestions WHERE type = $1 AND $2 = ANY(item_ids) AND status = $3 ORDER BY confidence DESC',
      ['related', parseInt(id), 'pending']
    );
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching related content:', error);
    res.status(500).json({ error: 'Failed to fetch related content' });
  }
};

exports.generateSuggestions = async (req, res) => {
  try {
    // Queue suggestion generation job
    const job = await suggestionQueue.add({});
    
    res.json({ message: 'Suggestion generation queued', jobId: job.id });
  } catch (error) {
    logger.error('Error queuing suggestion generation:', error);
    res.status(500).json({ error: 'Failed to queue suggestion generation' });
  }
};

exports.acceptSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE suggestions SET status = $1 WHERE id = $2 RETURNING *',
      ['accepted', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error accepting suggestion:', error);
    res.status(500).json({ error: 'Failed to accept suggestion' });
  }
};

exports.rejectSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE suggestions SET status = $1 WHERE id = $2 RETURNING *',
      ['rejected', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error rejecting suggestion:', error);
    res.status(500).json({ error: 'Failed to reject suggestion' });
  }
};
