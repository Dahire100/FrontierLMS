// routes/setting.js
const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get general settings
router.get('/general', settingController.getGeneralSettings);

// Update general settings
router.put('/general', settingController.updateGeneralSettings);

// Upload branding
router.post('/branding', settingController.uploadBranding);

module.exports = router;
