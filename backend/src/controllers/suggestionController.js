const db = require('../config/db');
const { suggestionQueue } = require('../config/queue');
const logger = require('../utils/logger');

exports.getAllSuggestions = async (req, res) => {
  try {
    const { status = 'pending', limit = 50 } = req.query;
    const userId = req.user.id;
    
    const result = await db.query(
      'SELECT * FROM suggestions WHERE status = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT $3',
      [status, userId, limit]
    );
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};

exports.getDuplicates = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'SELECT * FROM suggestions WHERE type = $1 AND status = $2 AND user_id = $3 ORDER BY confidence DESC',
      ['duplicate', 'pending', userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching duplicates:', error);
    res.status(500).json({ error: 'Failed to fetch duplicates' });
  }
};

exports.getStaleTabs = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'SELECT * FROM suggestions WHERE type = $1 AND status = $2 AND user_id = $3 ORDER BY created_at DESC',
      ['stale', 'pending', userId]
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
    const userId = req.user.id;
    
    const result = await db.query(
      'SELECT * FROM suggestions WHERE type = $1 AND $2 = ANY(item_ids) AND status = $3 AND user_id = $4 ORDER BY confidence DESC',
      ['related', parseInt(id), 'pending', userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching related content:', error);
    res.status(500).json({ error: 'Failed to fetch related content' });
  }
};

exports.generateSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    // Queue suggestion generation job
    const job = await suggestionQueue.add({ userId });
    
    res.json({ message: 'Suggestion generation queued', jobId: job.id });
  } catch (error) {
    logger.error('Error queuing suggestion generation:', error);
    res.status(500).json({ error: 'Failed to queue suggestion generation' });
  }
};

exports.acceptSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await db.run(
      'UPDATE suggestions SET status = $1 WHERE id = $2 AND user_id = $3',
      ['accepted', id, userId]
    );
    
    const suggestion = await db.get('SELECT * FROM suggestions WHERE id = $1 AND user_id = $2', [id, userId]);

    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    
    res.json(suggestion);
  } catch (error) {
    logger.error('Error accepting suggestion:', error);
    res.status(500).json({ error: 'Failed to accept suggestion' });
  }
};

exports.rejectSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await db.run(
      'UPDATE suggestions SET status = $1 WHERE id = $2 AND user_id = $3',
      ['rejected', id, userId]
    );
    
    const suggestion = await db.get('SELECT * FROM suggestions WHERE id = $1 AND user_id = $2', [id, userId]);

    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    
    res.json(suggestion);
  } catch (error) {
    logger.error('Error rejecting suggestion:', error);
    res.status(500).json({ error: 'Failed to reject suggestion' });
  }
};
