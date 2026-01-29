// routes/quiz.js
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticateToken } = require('../middleware/auth');

// Create quiz
router.post('/', authenticateToken, quizController.createQuiz);

// Get all quizzes
router.get('/', authenticateToken, quizController.getQuizzes);

// Get student quiz history (before :id route)
router.get('/student/:studentId/history', authenticateToken, quizController.getStudentQuizHistory);

// Get quiz by ID (for teachers)
router.get('/:id', authenticateToken, quizController.getQuizById);

// Get quiz for student
router.get('/:id/student', authenticateToken, quizController.getQuizForStudent);

// Update quiz
router.put('/:id', authenticateToken, quizController.updateQuiz);

// Delete quiz
router.delete('/:id', authenticateToken, quizController.deleteQuiz);

// Start quiz attempt
router.post('/:id/attempt/start', authenticateToken, quizController.startQuizAttempt);

// Submit quiz attempt
router.post('/:id/attempt/submit', authenticateToken, quizController.submitQuizAttempt);

// Get quiz results
router.get('/:id/results', authenticateToken, quizController.getQuizResults);

module.exports = router;
