// routes/classwork.js
const express = require('express');
const router = express.Router();
const classworkController = require('../controllers/classworkController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get statistics (before :id routes)
router.get('/stats/summary', classworkController.getClassworkStats);

// Get classwork by student (before :id routes)
router.get('/student/:studentId', classworkController.getClassworkByStudent);

// Create classwork
router.post('/', classworkController.createClasswork);

// Get all classwork
router.get('/', classworkController.getAllClasswork);

// Get classwork by ID
router.get('/:id', classworkController.getClassworkById);

// Update classwork
router.put('/:id', classworkController.updateClasswork);

// Delete classwork
router.delete('/:id', classworkController.deleteClasswork);

// Submit classwork
router.post('/:id/submit', classworkController.submitClasswork);

// Grade submission
router.put('/:id/submissions/:submissionId/grade', classworkController.gradeSubmission);

module.exports = router;
