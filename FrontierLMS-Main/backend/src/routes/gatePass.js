const express = require('express');
const router = express.Router();
const gatePassController = require('../controllers/gatePassController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', gatePassController.getAllGatePasses);
router.get('/:id', gatePassController.getGatePassById);
router.post('/', gatePassController.createGatePass);
router.put('/:id', gatePassController.updateGatePass);
router.delete('/:id', gatePassController.deleteItem || gatePassController.deleteGatePass); // Standardized to deleteGatePass

module.exports = router;
