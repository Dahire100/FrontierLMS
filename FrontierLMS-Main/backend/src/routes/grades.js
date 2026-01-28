const express = require('express');
const router = express.Router();
const { authenticateToken, requireSchoolAdmin } = require('../middleware/auth');
const { getAllGrades, addGrade, updateGrade, deleteGrade } = require('../controllers/gradeController');

router.use(authenticateToken);

router.get('/', getAllGrades);
router.post('/', requireSchoolAdmin, addGrade);
router.put('/:id', requireSchoolAdmin, updateGrade);
router.delete('/:id', requireSchoolAdmin, deleteGrade);

module.exports = router;
