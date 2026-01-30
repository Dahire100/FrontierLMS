const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const documentUpload = require('../middleware/documentUpload');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, documentUpload.single('file'), uploadController.uploadFile);

module.exports = router;
