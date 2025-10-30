const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');

router.post('/', bookmarkController.createBookmark);
router.get('/', bookmarkController.getAllBookmarks);
router.get('/:id', bookmarkController.getBookmarkById);
router.put('/:id', bookmarkController.updateBookmark);
router.delete('/:id', bookmarkController.deleteBookmark);
router.post('/:id/archive', bookmarkController.archiveBookmark);

module.exports = router;
