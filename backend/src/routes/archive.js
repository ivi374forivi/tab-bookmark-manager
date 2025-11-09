const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archiveController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, archiveController.archivePage);
router.get('/:id', authMiddleware, archiveController.getArchive);
router.get('/', authMiddleware, archiveController.getAllArchives);

module.exports = router;
