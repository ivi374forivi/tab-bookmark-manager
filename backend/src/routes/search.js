const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.post('/semantic', searchController.semanticSearch);
router.get('/text', searchController.textSearch);
router.get('/similar/:id', searchController.findSimilar);

module.exports = router;
