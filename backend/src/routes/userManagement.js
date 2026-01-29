// routes/userManagement.js
const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const { authenticateToken, requireSchoolAdmin } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireSchoolAdmin);

router.get('/', userManagementController.getUsersByRole);
router.patch('/:userId/status', userManagementController.toggleUserStatus);
router.delete('/:userId', userManagementController.deleteUserAccount);

module.exports = router;
