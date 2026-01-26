// routes/attendance.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireSchoolAdmin } = require('../middleware/auth');
const {
  markAttendance,
  getAttendanceByClass,
  getAttendanceSummary,
  getMonthlyReport,
  getRegisterData,
  getConsolidatedReport
} = require('../controllers/attendanceController');

router.use(authenticateToken);

// School admin and teachers can mark attendance
router.post('/', markAttendance);

// Accessible by school admin, teachers, and students (for their own data)
router.get('/', getAttendanceByClass);
router.get('/summary', getAttendanceSummary);
router.get('/monthly-report', getMonthlyReport);
router.get('/register', getRegisterData);
router.get('/consolidated', getConsolidatedReport);

module.exports = router;