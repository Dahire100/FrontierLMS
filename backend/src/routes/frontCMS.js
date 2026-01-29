// routes/frontCMS.js
const express = require('express');
const router = express.Router();
const frontCMSController = require('../controllers/frontCMSController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/settings', frontCMSController.getSettings);
router.put('/settings', frontCMSController.updateSettings);

module.exports = router;
