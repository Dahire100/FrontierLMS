// routes/consentLetter.js
const express = require('express');
const router = express.Router();
const consentLetterController = require('../controllers/consentLetterController');
const { authenticateToken } = require('../middleware/auth');

// Create consent request
router.post('/', authenticateToken, consentLetterController.createConsentRequest);

// Get all consent requests
router.get('/', authenticateToken, consentLetterController.getConsentRequests);

// Get consent requests by student (before :id route)
router.get('/student/:studentId', authenticateToken, consentLetterController.getConsentRequestsByStudent);

// Get single consent request
router.get('/:id', authenticateToken, consentLetterController.getConsentRequestById);

// Update consent request
router.put('/:id', authenticateToken, consentLetterController.updateConsentRequest);

// Update response (for parents)
router.post('/:id/response', authenticateToken, consentLetterController.updateResponse);

// Delete consent request
router.delete('/:id', authenticateToken, consentLetterController.deleteConsentRequest);

module.exports = router;
