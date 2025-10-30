const cron = require('node-cron');
const { suggestionQueue } = require('../config/queue');
const logger = require('../utils/logger');
const { pool } = require('../config/database');

class AutomationEngine {
  constructor() {
    this.jobs = [];
  }

  start() {
    logger.info('Starting Automation Engine...');

    // Generate suggestions every 6 hours
    this.jobs.push(
      cron.schedule('0 */6 * * *', async () => {
        logger.info('Running scheduled suggestion generation');
        try {
          await suggestionQueue.add({});
          logger.info('Suggestion generation queued successfully');
        } catch (error) {
          logger.error('Error queuing suggestion generation:', error);
        }
      })
    );

    // Clean up old stale suggestions every day at 2 AM
    this.jobs.push(
      cron.schedule('0 2 * * *', async () => {
        logger.info('Cleaning up old rejected suggestions');
        try {
          const result = await pool.query(
            "DELETE FROM suggestions WHERE status = 'rejected' AND created_at < NOW() - INTERVAL '30 days'"
          );
          logger.info(`Deleted ${result.rowCount} old suggestions`);
        } catch (error) {
          logger.error('Error cleaning up suggestions:', error);
        }
      })
    );

    // Archive old tabs weekly (Sunday at 3 AM)
    this.jobs.push(
      cron.schedule('0 3 * * 0', async () => {
        logger.info('Archiving old tabs');
        try {
          const { archivalQueue } = require('../config/queue');
          
          // Get tabs older than 90 days that are not archived
          const result = await pool.query(
            "SELECT id, url FROM tabs WHERE is_archived = FALSE AND created_at < NOW() - INTERVAL '90 days' LIMIT 100"
          );

          for (const tab of result.rows) {
            await archivalQueue.add({
              url: tab.url,
              itemId: tab.id,
              itemType: 'tab'
            });
          }

          logger.info(`Queued ${result.rows.length} tabs for archival`);
        } catch (error) {
          logger.error('Error archiving old tabs:', error);
        }
      })
    );

    // Update access statistics every hour
    this.jobs.push(
      cron.schedule('0 * * * *', async () => {
        logger.info('Updating access statistics');
        try {
          // Calculate average access counts, popular categories, etc.
          const stats = await pool.query(`
            SELECT 
              COUNT(*) as total_tabs,
              AVG(access_count) as avg_access_count,
              COUNT(CASE WHEN is_archived THEN 1 END) as archived_count
            FROM tabs
          `);

          logger.info('Statistics updated:', stats.rows[0]);
        } catch (error) {
          logger.error('Error updating statistics:', error);
        }
      })
    );

    // Check for duplicate tabs every 12 hours
    this.jobs.push(
      cron.schedule('0 */12 * * *', async () => {
        logger.info('Checking for duplicate tabs');
        try {
          const duplicates = await pool.query(`
            SELECT url, array_agg(id) as ids, COUNT(*) as count
            FROM tabs
            WHERE is_archived = FALSE
            GROUP BY url
            HAVING COUNT(*) > 1
          `);

          logger.info(`Found ${duplicates.rows.length} duplicate URL groups`);

          // Create suggestions for duplicates
          for (const dup of duplicates.rows) {
            await pool.query(
              'INSERT INTO suggestions (type, item_ids, reason, confidence) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
              ['duplicate', dup.ids, `${dup.count} tabs with URL: ${dup.url}`, 0.95]
            );
          }
        } catch (error) {
          logger.error('Error checking duplicates:', error);
        }
      })
    );

    logger.info(`Automation Engine started with ${this.jobs.length} scheduled jobs`);
  }

  stop() {
    logger.info('Stopping Automation Engine...');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    logger.info('Automation Engine stopped');
  }
}

module.exports = new AutomationEngine();
