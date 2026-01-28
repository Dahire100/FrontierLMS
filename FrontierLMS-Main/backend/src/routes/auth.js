// routes/auth.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { login, schoolLogin, getProfile, changePassword } = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.post('/school-login', schoolLogin);

// Protected routes
router.use(authenticateToken);
router.get('/profile', getProfile);
router.post('/change-password', changePassword);

module.exports = router;