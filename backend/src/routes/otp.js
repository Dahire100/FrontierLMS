const express = require('express');
const router = express.Router();
const { sendLoginOTP, verifyOTPAndLogin, resendOTP } = require('../controllers/otpController');

// Send OTP for login
router.post('/send-otp', sendLoginOTP);

// Verify OTP and login
router.post('/verify-otp', verifyOTPAndLogin);

// Resend OTP
router.post('/resend-otp', resendOTP);

module.exports = router;
