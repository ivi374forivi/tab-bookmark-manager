const { pool } = require('../config/database');
const logger = require('../utils/logger');

async function generateSuggestions() {
  logger.info('Starting suggestion generation');
  
  try {
    // Detect duplicates
    await detectDuplicates();
    
    // Detect stale tabs
    await detectStaleTabs();
    
    // Detect related content
    await detectRelatedContent();
    
    logger.info('Suggestion generation completed');
    return { success: true };
  } catch (error) {
    logger.error('Error generating suggestions:', error);
    throw error;
  }
}

async function detectDuplicates() {
  logger.info('Detecting duplicate tabs and bookmarks');
  
  // Find tabs with duplicate URLs
  const tabDuplicates = await pool.query(`
    SELECT url, array_agg(id) as ids
    FROM tabs
    WHERE is_archived = FALSE
    GROUP BY url
    HAVING COUNT(*) > 1
  `);
  
  for (const dup of tabDuplicates.rows) {
    await pool.query(
      'INSERT INTO suggestions (type, item_ids, reason, confidence) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
      ['duplicate', dup.ids, `Multiple tabs with the same URL: ${dup.url}`, 0.95]
    );
  }
  
  // Find bookmarks with duplicate URLs
  const bookmarkDuplicates = await pool.query(`
    SELECT url, array_agg(id) as ids
    FROM bookmarks
    WHERE is_archived = FALSE
    GROUP BY url
    HAVING COUNT(*) > 1
  `);
  
  for (const dup of bookmarkDuplicates.rows) {
    await pool.query(
      'INSERT INTO suggestions (type, item_ids, reason, confidence) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
      ['duplicate', dup.ids, `Multiple bookmarks with the same URL: ${dup.url}`, 0.95]
    );
  }
  
  logger.info(`Found ${tabDuplicates.rows.length} tab duplicates and ${bookmarkDuplicates.rows.length} bookmark duplicates`);
}

async function detectStaleTabs() {
  logger.info('Detecting stale tabs');
  
  const staleTabs = await pool.query(`
    SELECT id, url, title, last_accessed, created_at
    FROM tabs
    WHERE is_archived = FALSE
    AND (
      (last_accessed IS NOT NULL AND last_accessed < NOW() - INTERVAL '30 days')
      OR (last_accessed IS NULL AND created_at < NOW() - INTERVAL '30 days')
    )
  `);
  
  for (const tab of staleTabs.rows) {
    const daysSinceAccess = tab.last_accessed
      ? Math.floor((Date.now() - new Date(tab.last_accessed)) / (1000 * 60 * 60 * 24))
      : Math.floor((Date.now() - new Date(tab.created_at)) / (1000 * 60 * 60 * 24));
    
    await pool.query(
      'INSERT INTO suggestions (type, item_ids, reason, confidence) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
      ['stale', [tab.id], `Tab not accessed for ${daysSinceAccess} days`, 0.8]
    );
  }
  
  logger.info(`Found ${staleTabs.rows.length} stale tabs`);
}

async function detectRelatedContent() {
  logger.info('Detecting related content');
  
  // Find items with similar embeddings
  const items = await pool.query(`
    SELECT id, 'tab' as type, embedding
    FROM tabs
    WHERE embedding IS NOT NULL AND is_archived = FALSE
    UNION ALL
    SELECT id, 'bookmark' as type, embedding
    FROM bookmarks
    WHERE embedding IS NOT NULL AND is_archived = FALSE
  `);
  
  let relatedCount = 0;
  
  for (let i = 0; i < items.rows.length; i++) {
    const item1 = items.rows[i];
    
    // Find similar items (cosine similarity threshold)
    const similarItems = await pool.query(`
      (SELECT id, 'tab' as type, embedding <-> $1::vector as distance
       FROM tabs
       WHERE id != $2 AND embedding IS NOT NULL AND is_archived = FALSE
       ORDER BY distance
       LIMIT 5)
      UNION ALL
      (SELECT id, 'bookmark' as type, embedding <-> $1::vector as distance
       FROM bookmarks
       WHERE embedding IS NOT NULL AND is_archived = FALSE
       ORDER BY distance
       LIMIT 5)
      ORDER BY distance
      LIMIT 5
    `, [item1.embedding, item1.id]);
    
    if (similarItems.rows.length > 0 && similarItems.rows[0].distance < 0.3) {
      const relatedIds = [item1.id, ...similarItems.rows.map(r => r.id)];
      
      await pool.query(
        'INSERT INTO suggestions (type, item_ids, reason, confidence) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        ['related', relatedIds, 'Items with similar content', 0.7]
      );
      
      relatedCount++;
    }
  }
  
  logger.info(`Found ${relatedCount} groups of related content`);
}

module.exports = { generateSuggestions };
