const express = require('express');
const router = express.Router();
const tabController = require('../controllers/tabController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, tabController.createTab);
router.get('/', tabController.getAllTabs);
router.get('/:id', tabController.getTabById);
router.put('/:id', authMiddleware, tabController.updateTab);
router.delete('/:id', authMiddleware, tabController.deleteTab);
router.post('/:id/archive', authMiddleware, tabController.archiveTab);
router.get('/stale/detect', tabController.detectStaleTabs);

module.exports = router;
