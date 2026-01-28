const express = require('express');
const router = express.Router();
const staffAttendanceController = require('../controllers/staffAttendanceController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', staffAttendanceController.getStaffAttendanceByDate);
router.post('/', staffAttendanceController.markStaffAttendance);

module.exports = router;
