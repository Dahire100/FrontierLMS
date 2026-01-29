// routes/wallet.js
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get wallet details
router.get('/', walletController.getWallet);

// Get transactions
router.get('/transactions', walletController.getTransactions);

// Add money (Recharge)
router.post('/recharge', walletController.addMoney);

// Deduct money
router.post('/deduct', walletController.deductMoney);

// Set status
router.put('/status', walletController.setWalletStatus);

module.exports = router;
