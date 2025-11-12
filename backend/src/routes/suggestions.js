const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/suggestions:
 *   get:
 *     summary: Get all suggestions
 *     tags: [Suggestions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of suggestions
 */
router.get('/', authMiddleware, suggestionController.getAllSuggestions);

/**
 * @swagger
 * /api/suggestions/duplicates:
 *   get:
 *     summary: Get duplicate suggestions
 *     tags: [Suggestions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of duplicate suggestions
 */
router.get('/duplicates', authMiddleware, suggestionController.getDuplicates);

/**
 * @swagger
 * /api/suggestions/stale:
 *   get:
 *     summary: Get stale tab suggestions
 *     tags: [Suggestions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of stale tab suggestions
 */
router.get('/stale', authMiddleware, suggestionController.getStaleTabs);

/**
 * @swagger
 * /api/suggestions/related/{id}:
 *   get:
 *     summary: Get related content suggestions
 *     tags: [Suggestions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of related content suggestions
 */
router.get('/related/:id', authMiddleware, suggestionController.getRelatedContent);

/**
 * @swagger
 * /api/suggestions/generate:
 *   post:
 *     summary: Generate new suggestions
 *     tags: [Suggestions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Suggestions generated successfully
 */
router.post('/generate', authMiddleware, suggestionController.generateSuggestions);

/**
 * @swagger
 * /api/suggestions/{id}/accept:
 *   put:
 *     summary: Accept a suggestion
 *     tags: [Suggestions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Suggestion accepted successfully
 */
router.put('/:id/accept', authMiddleware, suggestionController.acceptSuggestion);

/**
 * @swagger
 * /api/suggestions/{id}/reject:
 *   put:
 *     summary: Reject a suggestion
 *     tags: [Suggestions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Suggestion rejected successfully
 */
router.put('/:id/reject', authMiddleware, suggestionController.rejectSuggestion);

module.exports = router;
