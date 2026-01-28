// routes/systemSetting.js
const express = require('express');
const router = express.Router();
const systemSettingController = require('../controllers/systemSettingController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get system settings
router.get('/', systemSettingController.getSystemSettings);

// Update system settings
router.put('/', systemSettingController.updateSystemSettings);

// Trigger backup
router.post('/backup', systemSettingController.triggerBackup);

// Test Configuration
router.post('/test', systemSettingController.testConfiguration);

module.exports = router;
