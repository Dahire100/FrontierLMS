// routes/income.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllIncome,
  getIncomeStats,
  createIncome,
  updateIncome,
  deleteIncome
} = require('../controllers/incomeController');

// All routes require authentication
router.use(authenticateToken);

router.get('/stats', getIncomeStats);
router.get('/search', getAllIncome);
router.get('/', getAllIncome);
router.post('/', createIncome);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;
