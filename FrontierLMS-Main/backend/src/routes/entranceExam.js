const express = require('express');
const router = express.Router();
const entranceExamController = require('../controllers/entranceExamController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', entranceExamController.getAllExams);
router.get('/:id', entranceExamController.getExamById);
router.post('/', entranceExamController.createExam);
router.put('/:id', entranceExamController.updateExam);
router.delete('/:id', entranceExamController.deleteExam);

module.exports = router;
