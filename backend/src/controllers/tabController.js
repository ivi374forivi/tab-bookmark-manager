const { pool } = require('../config/database');
const { contentAnalysisQueue } = require('../config/queue');
const logger = require('../utils/logger');

exports.createTab = async (req, res) => {
  try {
    const { url, title, favicon, content } = req.body;
    
    const result = await pool.query(
      'INSERT INTO tabs (url, title, favicon, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [url, title, favicon, content]
    );
    
    const tab = result.rows[0];
    
    // Queue content analysis
    if (content) {
      await contentAnalysisQueue.add({
        itemId: tab.id,
        itemType: 'tab',
        url,
        content
      });
    }
    
    res.status(201).json(tab);
  } catch (error) {
    logger.error('Error creating tab:', error);
    res.status(500).json({ error: 'Failed to create tab' });
  }
};

exports.getAllTabs = async (req, res) => {
  try {
    const { limit = 100, offset = 0, archived = false } = req.query;
    
    const result = await pool.query(
      'SELECT * FROM tabs WHERE is_archived = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [archived, limit, offset]
    );
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching tabs:', error);
    res.status(500).json({ error: 'Failed to fetch tabs' });
  }
};

exports.getTabById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE tabs SET access_count = access_count + 1, last_accessed = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tab not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching tab:', error);
    res.status(500).json({ error: 'Failed to fetch tab' });
  }
};

exports.updateTab = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, category } = req.body;
    
    const result = await pool.query(
      'UPDATE tabs SET title = COALESCE($1, title), content = COALESCE($2, content), tags = COALESCE($3, tags), category = COALESCE($4, category), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [title, content, tags, category, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tab not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating tab:', error);
    res.status(500).json({ error: 'Failed to update tab' });
  }
};

exports.deleteTab = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM tabs WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tab not found' });
    }
    
    res.json({ message: 'Tab deleted successfully' });
  } catch (error) {
    logger.error('Error deleting tab:', error);
    res.status(500).json({ error: 'Failed to delete tab' });
  }
};

exports.archiveTab = async (req, res) => {
  try {
    const { id } = req.params;
    const { archivalQueue } = require('../config/queue');
    
    const result = await pool.query('SELECT * FROM tabs WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tab not found' });
    }
    
    const tab = result.rows[0];
    
    // Queue archival job
    await archivalQueue.add({ url: tab.url, itemId: id, itemType: 'tab' });
    
    // Mark as archived
    await pool.query('UPDATE tabs SET is_archived = TRUE WHERE id = $1', [id]);
    
    res.json({ message: 'Tab queued for archival' });
  } catch (error) {
    logger.error('Error archiving tab:', error);
    res.status(500).json({ error: 'Failed to archive tab' });
  }
};

exports.detectStaleTabs = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const result = await pool.query(
      'SELECT * FROM tabs WHERE last_accessed < NOW() - INTERVAL \'$1 days\' OR (last_accessed IS NULL AND created_at < NOW() - INTERVAL \'$1 days\') ORDER BY last_accessed ASC',
      [days]
    );
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error detecting stale tabs:', error);
    res.status(500).json({ error: 'Failed to detect stale tabs' });
  }
};
