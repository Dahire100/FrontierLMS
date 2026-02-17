const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Initiate Paytm Transaction
router.post('/initiate', paymentController.initiateTransaction);

// Callback (Verify checksum)
router.post('/callback', paymentController.handleCallback);

// Transaction Status Check
router.post('/status', paymentController.checkStatus);

module.exports = router;
