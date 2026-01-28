const express = require('express');
const router = express.Router();
const controller = require('../controllers/questionTypeController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', controller.createType);
router.get('/', controller.getAllTypes);
router.put('/:id', controller.updateType);
router.delete('/:id', controller.deleteType);

module.exports = router;
