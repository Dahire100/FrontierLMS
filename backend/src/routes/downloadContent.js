const express = require('express');
const router = express.Router();
const downloadContentController = require('../controllers/downloadContentController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create new download content
router.post('/', downloadContentController.createDownloadContent);

// Get all download contents
router.get('/', downloadContentController.getAllDownloadContents);

// Get download statistics
router.get('/stats', downloadContentController.getDownloadStats);

// Get download content by ID
router.get('/:id', downloadContentController.getDownloadContentById);

// Update download content
router.put('/:id', downloadContentController.updateDownloadContent);

// Delete download content
router.delete('/:id', downloadContentController.deleteDownloadContent);

// Increment download count
router.post('/:id/download', downloadContentController.incrementDownload);

// Bulk delete download contents
router.post('/bulk-delete', downloadContentController.bulkDeleteDownloadContents);

module.exports = router;
