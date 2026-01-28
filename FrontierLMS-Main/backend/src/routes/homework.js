// routes/homework.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllHomework,
  getHomeworkById,
  createHomework,
  updateHomework,
  submitHomework,
  gradeHomework,
  deleteHomework
} = require('../controllers/homeworkController');

// All routes require authentication
router.use(authenticateToken);

router.get('/', getAllHomework);
router.get('/:id', getHomeworkById);
router.post('/', createHomework);
router.put('/:id', updateHomework);
router.post('/:id/submit', submitHomework);
router.post('/:id/grade/:studentId', gradeHomework);
router.delete('/:id', deleteHomework);

module.exports = router;
