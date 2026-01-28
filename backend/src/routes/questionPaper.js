// routes/questionPaper.js
const express = require('express');
const router = express.Router();
const questionPaperController = require('../controllers/questionPaperController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get statistics (before :id routes)
router.get('/stats/summary', questionPaperController.getQuestionPaperStats);

// Get papers by subject (before :id routes)
router.get('/subject/:subject', questionPaperController.getQuestionPapersBySubject);

// Create question paper
router.post('/', questionPaperController.createQuestionPaper);

// Get all question papers
router.get('/', questionPaperController.getAllQuestionPapers);

// Get question paper by ID
router.get('/:id', questionPaperController.getQuestionPaperById);

// Update question paper
router.put('/:id', questionPaperController.updateQuestionPaper);

// Delete question paper
router.delete('/:id', questionPaperController.deleteQuestionPaper);

// Add section
router.post('/:id/sections', questionPaperController.addSection);

// Add question to section
router.post('/:id/sections/:sectionIndex/questions', questionPaperController.addQuestion);

// Approve question paper
router.post('/:id/approve', questionPaperController.approveQuestionPaper);

// Publish question paper
router.post('/:id/publish', questionPaperController.publishQuestionPaper);

module.exports = router;
