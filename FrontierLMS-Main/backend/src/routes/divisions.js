const express = require('express');
const router = express.Router();
const { authenticateToken, requireSchoolAdmin } = require('../middleware/auth');
const { getAllDivisions, addDivision, updateDivision, deleteDivision } = require('../controllers/divisionController');

router.use(authenticateToken);

router.get('/', getAllDivisions);
router.post('/', requireSchoolAdmin, addDivision);
router.put('/:id', requireSchoolAdmin, updateDivision);
router.delete('/:id', requireSchoolAdmin, deleteDivision);

module.exports = router;
