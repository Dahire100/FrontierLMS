const express = require('express');
const router = express.Router();
const syllabusController = require('../controllers/syllabusController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create new syllabus
router.post('/', syllabusController.createSyllabus);

// Get all syllabi
router.get('/', syllabusController.getAllSyllabi);

// Get syllabus by ID
router.get('/:id', syllabusController.getSyllabusById);

// Update syllabus
router.put('/:id', syllabusController.updateSyllabus);

// Delete syllabus
router.delete('/:id', syllabusController.deleteSyllabus);

// Increment download count
router.post('/:id/download', syllabusController.incrementDownload);

// Bulk delete syllabi
router.post('/bulk-delete', syllabusController.bulkDeleteSyllabi);

module.exports = router;
