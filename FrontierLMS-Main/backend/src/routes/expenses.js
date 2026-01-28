// routes/expenses.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllExpenses,
  getExpenseStats,
  createExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');

// All routes require authentication
router.use(authenticateToken);

router.get('/stats', getExpenseStats);
router.get('/search', getAllExpenses);
router.get('/', getAllExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
