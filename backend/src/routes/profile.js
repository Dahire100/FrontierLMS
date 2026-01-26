// routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');

const profileUpload = require('../middleware/profileUpload');

router.use(authenticateToken);

// Get my profile
router.get('/', profileController.getMyProfile);

// Update my profile
router.put('/', profileController.updateMyProfile);

// Upload profile photo
router.post('/upload-photo', profileUpload.single('photo'), profileController.uploadProfilePhoto);

// Change password
router.post('/change-password', profileController.changePassword);

module.exports = router;
