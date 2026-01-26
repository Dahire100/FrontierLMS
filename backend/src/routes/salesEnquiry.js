const express = require('express');
const router = express.Router();
const salesEnquiryController = require('../controllers/salesEnquiryController');

const { authenticateToken } = require('../middleware/auth');

// Public route - No authentication required
router.post('/', salesEnquiryController.createEnquiry);

// Protected routes
router.get('/', authenticateToken, salesEnquiryController.getAllEnquiries);
router.patch('/:id/status', authenticateToken, salesEnquiryController.updateEnquiryStatus);

module.exports = router;
