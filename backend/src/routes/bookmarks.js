const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, bookmarkController.createBookmark);
router.get('/', bookmarkController.getAllBookmarks);
router.get('/:id', bookmarkController.getBookmarkById);
router.put('/:id', authMiddleware, bookmarkController.updateBookmark);
router.delete('/:id', authMiddleware, bookmarkController.deleteBookmark);
router.post('/:id/archive', authMiddleware, bookmarkController.archiveBookmark);

module.exports = router;
