// routes/exams.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireSchoolAdmin } = require('../middleware/auth');
const {
  getAllExams,
  addExam,
  updateExam,
  deleteExam,
  addResult,
  addBulkResults,
  getExamResults,
  getStudentResults,
  getExamSchedule,
  getExamStatistics,
  getClassPerformanceReport,
  getTopPerformers,
  getExamById,
  updateResult,
  deleteResult,
  getAdmitCards
} = require('../controllers/examsController');

router.use(authenticateToken);

// Get exam schedule/timetable (before :id routes)
router.get('/schedule', getExamSchedule);

// Get class performance report (before :id routes)
router.get('/reports/class-performance', getClassPerformanceReport);

// Get top performers (before :id routes)
router.get('/reports/top-performers', getTopPerformers);

// Get admit cards
router.get('/admit-cards', getAdmitCards);

// School admin only routes
router.post('/', requireSchoolAdmin, addExam);
router.put('/:id', requireSchoolAdmin, updateExam);
router.delete('/:id', requireSchoolAdmin, deleteExam);

// Results management
router.post('/results', addResult);
router.post('/results/bulk', addBulkResults);
router.put('/results/:id', updateResult);
router.delete('/results/:id', deleteResult);

// Accessible by school admin, teachers, and students
router.get('/', getAllExams);
router.get('/:id', getExamById);
router.get('/:examId/results', getExamResults);
router.get('/:examId/statistics', getExamStatistics);
router.get('/student/:studentId/results', getStudentResults);

module.exports = router;