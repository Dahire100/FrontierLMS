// routes/report.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Dashboard Summary
router.get('/dashboard', reportController.getDashboardSummary);

// Student Attendance Report
router.get('/attendance', reportController.getAttendanceReport);

// Financial Report
router.get('/finance', reportController.getFinancialReport);

// Class Strength Report
router.get('/class-strength', reportController.getClassStrengthReport);

// Transaction Report
router.get('/transactions', reportController.getTransactionReport);

// Activity Log
router.get('/activity-log', reportController.getActivityLog);

// Document Availability
router.get('/document-availability', reportController.getDocumentAvailability);

// Lesson Planner Report
router.get('/lesson-planner', reportController.getLessonPlannerReport);

// App Login Status
router.get('/app-login-status', reportController.getAppLoginStatus);

module.exports = router;
