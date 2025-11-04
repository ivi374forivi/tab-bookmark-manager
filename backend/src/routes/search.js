const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/semantic', authMiddleware, searchController.semanticSearch);
router.get('/text', searchController.textSearch);
router.get('/similar/:id', searchController.findSimilar);

module.exports = router;
