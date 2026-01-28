// routes/primaryEvaluation.js
const express = require('express');
const router = express.Router();
const primaryEvaluationController = require('../controllers/primaryEvaluationController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get statistics (before :id routes)
router.get('/stats', primaryEvaluationController.getEvaluationStats);

// Get student report card (before :id routes)
router.get('/student/:studentId/report-card', primaryEvaluationController.getStudentReportCard);

// Get class performance (before :id routes)
router.get('/class/:classId/performance', primaryEvaluationController.getClassPerformance);

// Bulk create evaluations
router.post('/bulk', primaryEvaluationController.bulkCreateEvaluations);

// Create evaluation
router.post('/', primaryEvaluationController.createEvaluation);

// Get all evaluations
router.get('/', primaryEvaluationController.getAllEvaluations);

// Get evaluation by ID
router.get('/:id', primaryEvaluationController.getEvaluationById);

// Update evaluation
router.put('/:id', primaryEvaluationController.updateEvaluation);

// Delete evaluation
router.delete('/:id', primaryEvaluationController.deleteEvaluation);

// Finalize evaluation
router.post('/:id/finalize', primaryEvaluationController.finalizeEvaluation);

module.exports = router;
