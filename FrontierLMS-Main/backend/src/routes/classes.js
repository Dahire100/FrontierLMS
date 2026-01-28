// routes/classes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStats,
  assignSubjects,
  getClassStudents,
  promoteClass
} = require('../controllers/classController');

// All routes require authentication
router.use(authenticateToken);

// Class statistics
router.get('/stats', getClassStats);

// CRUD operations
router.get('/', getAllClasses);
router.get('/:id', getClassById);
router.post('/', createClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);
router.post('/:id/subjects', assignSubjects);
router.get('/:id/students', getClassStudents);
router.post('/promote', promoteClass);

module.exports = router;
