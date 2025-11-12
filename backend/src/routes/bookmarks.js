const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, bookmarkController.createBookmark);
router.post('/bulk', authMiddleware, bookmarkController.bulkCreateBookmarks);
router.get('/', authMiddleware, bookmarkController.getAllBookmarks);
router.get('/:id', authMiddleware, bookmarkController.getBookmarkById);
router.put('/:id', authMiddleware, bookmarkController.updateBookmark);
router.delete('/:id', authMiddleware, bookmarkController.deleteBookmark);
router.post('/:id/archive', authMiddleware, bookmarkController.archiveBookmark);

module.exports = router;
