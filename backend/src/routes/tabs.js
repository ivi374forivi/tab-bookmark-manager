const express = require('express');
const router = express.Router();
const tabController = require('../controllers/tabController');

router.post('/', tabController.createTab);
router.get('/', tabController.getAllTabs);
router.get('/:id', tabController.getTabById);
router.put('/:id', tabController.updateTab);
router.delete('/:id', tabController.deleteTab);
router.post('/:id/archive', tabController.archiveTab);
router.get('/stale/detect', tabController.detectStaleTabs);

module.exports = router;
