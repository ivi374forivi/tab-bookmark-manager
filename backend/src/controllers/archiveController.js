const { pool } = require('../config/database');
const { archivalQueue } = require('../config/queue');
const logger = require('../utils/logger');

exports.archivePage = async (req, res) => {
  try {
    const { url } = req.body;
    
    // Queue archival job
    const job = await archivalQueue.add({ url });
    
    res.json({ message: 'Page queued for archival', jobId: job.id });
  } catch (error) {
    logger.error('Error queuing archival:', error);
    res.status(500).json({ error: 'Failed to queue archival' });
  }
};

exports.getArchive = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM archived_pages WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archive not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching archive:', error);
    res.status(500).json({ error: 'Failed to fetch archive' });
  }
};

exports.getAllArchives = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await pool.query(
      'SELECT * FROM archived_pages ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching archives:', error);
    res.status(500).json({ error: 'Failed to fetch archives' });
  }
};
