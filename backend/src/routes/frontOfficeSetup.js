const express = require('express');
const router = express.Router();
const frontOfficeSetupController = require('../controllers/frontOfficeSetupController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', frontOfficeSetupController.getAllSetupItems);
router.get('/:id', frontOfficeSetupController.getItemById);
router.post('/', frontOfficeSetupController.createItem);
router.put('/:id', frontOfficeSetupController.updateItem);
router.delete('/:id', frontOfficeSetupController.deleteItem);

module.exports = router;
