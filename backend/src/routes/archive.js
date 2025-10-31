const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archiveController');

router.post('/', archiveController.archivePage);
router.get('/:id', archiveController.getArchive);
router.get('/', archiveController.getAllArchives);

module.exports = router;
