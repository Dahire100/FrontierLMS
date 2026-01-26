const express = require('express');
const router = express.Router();
const admissionEnquiryController = require('../controllers/admissionEnquiryController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', admissionEnquiryController.getAllEnquiries);
router.get('/:id', admissionEnquiryController.getEnquiryById);
router.post('/', admissionEnquiryController.createEnquiry);
router.put('/:id', admissionEnquiryController.updateEnquiry);
router.delete('/:id', admissionEnquiryController.deleteEnquiry);

module.exports = router;
