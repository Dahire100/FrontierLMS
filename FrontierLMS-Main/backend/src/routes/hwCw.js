// routes/hwCw.js
const express = require('express');
const router = express.Router();
const hwCwController = require('../controllers/hwCwController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get statistics (before :id routes)
router.get('/stats', hwCwController.getHwCwStats);

// Get upcoming deadlines (before :id routes)
router.get('/upcoming', hwCwController.getUpcomingDeadlines);

// Get overdue items (before :id routes)
router.get('/overdue', hwCwController.getOverdueItems);

// Get completion rate (before :id routes)
router.get('/completion-rate', hwCwController.getCompletionRate);

// Get unified view (combined homework & classwork)
router.get('/', hwCwController.getUnifiedView);

// Get unified view by student
router.get('/student/:studentId', hwCwController.getUnifiedViewByStudent);

module.exports = router;
