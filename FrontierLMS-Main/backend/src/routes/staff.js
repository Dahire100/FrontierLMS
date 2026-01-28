// routes/staff.js
const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get staff statistics (before :id routes)
router.get('/stats/summary', staffController.getStaffStatistics);

// Get staff by role (before :id routes)
router.get('/role/:role', staffController.getStaffByRole);

// Get staff by department (before :id routes)
router.get('/department/:department', staffController.getStaffByDepartment);

// Create staff
router.post('/', staffController.createStaff);

// Get all staff
router.get('/', staffController.getAllStaff);

// Get staff by ID
router.get('/:id', staffController.getStaffById);

// Update staff
router.put('/:id', staffController.updateStaff);

// Delete staff
router.delete('/:id', staffController.deleteStaff);

// Toggle active status
router.patch('/:id/toggle', staffController.toggleActiveStatus);

// Update salary
router.put('/:id/salary', staffController.updateSalary);

module.exports = router;
