const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archiveController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/archive:
 *   post:
 *     summary: Archive a web page
 *     tags: [Archive]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Page archived successfully
 */
router.post('/', authMiddleware, archiveController.archivePage);

/**
 * @swagger
 * /api/archive/{id}:
 *   get:
 *     summary: Get archived page by ID
 *     tags: [Archive]
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
 *         description: Archived page details
 */
router.get('/:id', authMiddleware, archiveController.getArchive);

/**
 * @swagger
 * /api/archive:
 *   get:
 *     summary: Get all archived pages
 *     tags: [Archive]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of archived pages
 */
router.get('/', authMiddleware, archiveController.getAllArchives);

module.exports = router;
