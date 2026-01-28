const express = require('express');
const router = express.Router();
const leaveTypeController = require('../controllers/leaveTypeController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', leaveTypeController.getAllLeaveTypes);
router.post('/', leaveTypeController.createLeaveType);
router.put('/:id', leaveTypeController.updateLeaveType);
router.delete('/:id', leaveTypeController.deleteLeaveType);

module.exports = router;
