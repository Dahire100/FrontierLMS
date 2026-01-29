// routes/subjects.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');

// All routes require authentication
router.use(authenticateToken);

router.get('/', getAllSubjects);
router.post('/', createSubject);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

module.exports = router;
