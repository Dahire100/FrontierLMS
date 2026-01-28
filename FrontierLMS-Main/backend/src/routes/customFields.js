const express = require('express');
const router = express.Router();
const customFieldController = require('../controllers/customFieldController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', customFieldController.getCustomFields);
router.post('/', customFieldController.addCustomField);
router.put('/:id', customFieldController.updateCustomField);
router.delete('/:id', customFieldController.deleteCustomField);

module.exports = router;
