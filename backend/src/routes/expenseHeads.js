// routes/expenseHeads.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getAllHeads,
    createHead,
    updateHead,
    deleteHead
} = require('../controllers/expenseHeadController');

router.use(authenticateToken);

router.get('/', getAllHeads);
router.post('/', createHead);
router.put('/:id', updateHead);
router.delete('/:id', deleteHead);

module.exports = router;
