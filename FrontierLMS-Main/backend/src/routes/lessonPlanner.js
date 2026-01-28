// routes/lessonPlanner.js
const express = require('express');
const router = express.Router();
const lessonPlannerController = require('../controllers/lessonPlannerController');
const { authenticateToken } = require('../middleware/auth');

// Create lesson plan
router.post('/', authenticateToken, lessonPlannerController.createLessonPlan);

// Get all lesson plans
router.get('/', authenticateToken, lessonPlannerController.getLessonPlans);

// Get lesson plans by teacher (before :id route)
router.get('/teacher/me', authenticateToken, lessonPlannerController.getLessonPlansByTeacher);

// Get topics (before :id route)
router.get('/topics/list', authenticateToken, lessonPlannerController.getTopics);

// Get lesson plan report (before :id route)
router.get('/reports/summary', authenticateToken, lessonPlannerController.getLessonPlanReport);

// Get lesson plan by ID
router.get('/:id', authenticateToken, lessonPlannerController.getLessonPlanById);

// Update lesson plan
router.put('/:id', authenticateToken, lessonPlannerController.updateLessonPlan);

// Delete lesson plan
router.delete('/:id', authenticateToken, lessonPlannerController.deleteLessonPlan);

module.exports = router;
