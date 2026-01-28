// routes/certificates.js
const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { verifyToken } = require('../middleware/auth');
const { verifyRole } = require('../middleware/roleAuth');

// Get all certificates
router.get('/', verifyToken, verifyRole(['school_admin', 'super_admin']), certificateController.getAllCertificates);

// Get certificate statistics
router.get('/stats', verifyToken, verifyRole(['school_admin', 'super_admin']), certificateController.getCertificateStats);

// Verify certificate by certificate number (public endpoint)
router.get('/verify/:certificateNumber', certificateController.verifyCertificate);

// Get certificate by ID
router.get('/:id', verifyToken, verifyRole(['school_admin', 'super_admin']), certificateController.getCertificateById);

// Create certificate
router.post('/', verifyToken, verifyRole(['school_admin', 'super_admin']), certificateController.createCertificate);

// Update certificate
router.put('/:id', verifyToken, verifyRole(['school_admin', 'super_admin']), certificateController.updateCertificate);

// Revoke certificate
router.patch('/:id/revoke', verifyToken, verifyRole(['school_admin', 'super_admin']), certificateController.revokeCertificate);

// Delete certificate
router.delete('/:id', verifyToken, verifyRole(['school_admin', 'super_admin']), certificateController.deleteCertificate);

module.exports = router;
