// routes/dashboard.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getDashboardData, getSchoolAdminStats, getRecentStudents, getFeeSummary, getSuperAdminStats, generateReport } = require('../controllers/dashboardController');

router.use(authenticateToken);

// Main dashboard endpoint
router.get('/', getDashboardData);

// Generate Report endpoint
router.get('/report', generateReport);

// Specific dashboard components
router.get('/stats', (req, res) => {
  if (req.user.role === 'super_admin') {
    getSuperAdminStats(req, res);
  } else {
    getSchoolAdminStats(req, res);
  }
});

router.get('/recent-students', getRecentStudents);
router.get('/fee-summary', getFeeSummary);

module.exports = router;