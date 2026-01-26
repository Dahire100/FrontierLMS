const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrModuleController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Task Routes
router.get('/tasks', hrController.getTasks);
router.post('/tasks', hrController.createTask);

// Advance Routes
router.get('/advances', hrController.getAdvances);
router.post('/advances', hrController.createAdvance);

// Recruitment Routes
router.get('/recruitments', hrController.getRecruitments);
router.post('/recruitments', hrController.createRecruitment);

module.exports = router;
