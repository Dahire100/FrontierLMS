const express = require('express');
const router = express.Router();
const { getIDCard, downloadIDCard, regenerateIDCard } = require('../controllers/idCardController');
const { authenticateToken } = require('../middleware/auth');

// Get ID card details
router.get('/:userId', authenticateToken, getIDCard);

// Download ID card PDF
router.get('/download/:userId', authenticateToken, downloadIDCard);

// Regenerate ID card (admin only)
router.post('/regenerate/:userId', authenticateToken, regenerateIDCard);

module.exports = router;