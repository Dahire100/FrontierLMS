const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', visitorController.getAllVisitors);
router.get('/:id', visitorController.getVisitorById);
router.post('/', visitorController.createVisitor);
router.put('/:id', visitorController.updateVisitor);
router.delete('/:id', visitorController.deleteVisitor);

module.exports = router;
