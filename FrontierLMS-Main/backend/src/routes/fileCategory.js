const express = require('express');
const router = express.Router();
const fileCategoryController = require('../controllers/fileCategoryController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create new file category
router.post('/', fileCategoryController.createFileCategory);

// Get all file categories
router.get('/', fileCategoryController.getAllFileCategories);

// Get file category by ID
router.get('/:id', fileCategoryController.getFileCategoryById);

// Update file category
router.put('/:id', fileCategoryController.updateFileCategory);

// Delete file category
router.delete('/:id', fileCategoryController.deleteFileCategory);

// Bulk delete file categories
router.post('/bulk-delete', fileCategoryController.bulkDeleteFileCategories);

module.exports = router;
