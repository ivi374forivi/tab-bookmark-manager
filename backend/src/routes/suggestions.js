const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, suggestionController.getAllSuggestions);
router.get('/duplicates', authMiddleware, suggestionController.getDuplicates);
router.get('/stale', authMiddleware, suggestionController.getStaleTabs);
router.get('/related/:id', authMiddleware, suggestionController.getRelatedContent);
router.post('/generate', authMiddleware, suggestionController.generateSuggestions);
router.put('/:id/accept', authMiddleware, suggestionController.acceptSuggestion);
router.put('/:id/reject', authMiddleware, suggestionController.rejectSuggestion);

module.exports = router;
