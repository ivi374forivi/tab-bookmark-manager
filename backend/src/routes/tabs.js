const express = require('express');
const router = express.Router();
const tabController = require('../controllers/tabController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, tabController.createTab);
router.post('/bulk', authMiddleware, tabController.bulkCreateTabs);
router.get('/', authMiddleware, tabController.getAllTabs);
router.get('/:id', authMiddleware, tabController.getTabById);
router.put('/:id', authMiddleware, tabController.updateTab);
router.delete('/:id', authMiddleware, tabController.deleteTab);
router.post('/:id/archive', authMiddleware, tabController.archiveTab);
router.get('/stale/detect', authMiddleware, tabController.detectStaleTabs);

module.exports = router;
