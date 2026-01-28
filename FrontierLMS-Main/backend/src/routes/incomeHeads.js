const express = require('express');
const router = express.Router();
const incomeHeadController = require('../controllers/incomeHeadController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, incomeHeadController.getAllHeads);
router.post('/', authenticateToken, incomeHeadController.createHead);
router.put('/:id', authenticateToken, incomeHeadController.updateHead);
router.delete('/:id', authenticateToken, incomeHeadController.deleteHead);

module.exports = router;
