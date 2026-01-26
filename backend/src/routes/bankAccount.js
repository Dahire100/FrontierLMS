// routes/bankAccount.js
const express = require('express');
const router = express.Router();
const bankAccountController = require('../controllers/bankAccountController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get statistics (before :id routes)
router.get('/stats/summary', bankAccountController.getBankAccountStats);

// Create bank account
router.post('/', bankAccountController.createBankAccount);

// Get all bank accounts
router.get('/', bankAccountController.getAllBankAccounts);

// Get bank account by ID
router.get('/:id', bankAccountController.getBankAccountById);

// Update bank account
router.put('/:id', bankAccountController.updateBankAccount);

// Delete bank account
router.delete('/:id', bankAccountController.deleteBankAccount);

// Toggle active status
router.patch('/:id/toggle', bankAccountController.toggleActiveStatus);

// Add transaction
router.post('/:id/transaction', bankAccountController.addTransaction);

// Get transactions
router.get('/:id/transactions', bankAccountController.getTransactions);

module.exports = router;
