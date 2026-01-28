// routes/leave.js
const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken } = require('../middleware/auth');
const { verifyRole } = require('../middleware/roleAuth');

// Get all leave requests (admin)
router.get('/', verifyToken, verifyRole(['school_admin', 'super_admin']), leaveController.getAllLeaveRequests);

// Get my leave requests
router.get('/my-requests', verifyToken, leaveController.getMyLeaveRequests);

// Get leave summary
router.get('/summary', verifyToken, verifyRole(['school_admin', 'super_admin']), leaveController.getLeaveSummary);

// Create leave request
router.post('/', verifyToken, leaveController.createLeaveRequest);

// Update leave request
router.put('/:id', verifyToken, leaveController.updateLeaveRequest);

// Cancel leave request
router.patch('/:id/cancel', verifyToken, leaveController.cancelLeaveRequest);

// Approve leave request
router.patch('/:id/approve', verifyToken, verifyRole(['school_admin', 'super_admin']), leaveController.approveLeaveRequest);

// Reject leave request
router.patch('/:id/reject', verifyToken, verifyRole(['school_admin', 'super_admin']), leaveController.rejectLeaveRequest);

// Delete leave request
router.delete('/:id', verifyToken, leaveController.deleteLeaveRequest);

module.exports = router;
