// routes/notices.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  togglePin
} = require('../controllers/noticeController');

// All routes require authentication
router.use(authenticateToken);

router.get('/', getAllNotices);
router.get('/:id', getNoticeById);
router.post('/', createNotice);
router.put('/:id', updateNotice);
router.patch('/:id/toggle-pin', togglePin);
router.delete('/:id', deleteNotice);

module.exports = router;
