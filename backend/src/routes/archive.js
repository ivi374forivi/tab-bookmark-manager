const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archiveController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, archiveController.archivePage);
router.get('/:id', archiveController.getArchive);
router.get('/', archiveController.getAllArchives);

module.exports = router;
