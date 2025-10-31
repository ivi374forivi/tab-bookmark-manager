const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');

router.get('/', suggestionController.getAllSuggestions);
router.get('/duplicates', suggestionController.getDuplicates);
router.get('/stale', suggestionController.getStaleTabs);
router.get('/related/:id', suggestionController.getRelatedContent);
router.post('/generate', suggestionController.generateSuggestions);
router.put('/:id/accept', suggestionController.acceptSuggestion);
router.put('/:id/reject', suggestionController.rejectSuggestion);

module.exports = router;
