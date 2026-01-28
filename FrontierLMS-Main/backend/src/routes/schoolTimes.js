const express = require('express');
const router = express.Router();
const schoolTimeController = require('../controllers/schoolTimeController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', schoolTimeController.getSchoolTimes);
router.post('/', schoolTimeController.addSchoolTime);
router.put('/:id', schoolTimeController.updateSchoolTime);
router.delete('/:id', schoolTimeController.deleteSchoolTime);

module.exports = router;
