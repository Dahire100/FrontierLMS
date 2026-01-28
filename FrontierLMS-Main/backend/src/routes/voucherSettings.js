const express = require('express');
const router = express.Router();
const voucherSettingController = require('../controllers/voucherSettingController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, voucherSettingController.getAllSettings);
router.post('/', authenticateToken, voucherSettingController.createSetting);
router.put('/:id', authenticateToken, voucherSettingController.updateSetting);
router.delete('/:id', authenticateToken, voucherSettingController.deleteSetting);

module.exports = router;
