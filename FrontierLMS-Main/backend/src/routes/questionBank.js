const express = require('express');
const router = express.Router();
const controller = require('../controllers/questionBankController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', controller.createQuestion);
router.get('/', controller.getQuestions);
router.put('/:id', controller.updateQuestion);
router.delete('/:id', controller.deleteQuestion);

module.exports = router;
