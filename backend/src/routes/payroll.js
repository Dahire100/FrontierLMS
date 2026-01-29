const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { authenticateToken } = require('../middleware/auth');

const protect = authenticateToken; // For backward compatibility within this file if needed, or just use authenticateToken directly

router.get('/', protect, payrollController.getStaffForPayroll);
router.post('/generate', protect, payrollController.generatePayroll);
router.put('/:id/pay', protect, payrollController.markAsPaid);

module.exports = router;
