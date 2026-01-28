const OTP = require('../models/OTP');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for login
exports.sendLoginOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: 'User not found. Please check your email address.' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ error: 'Your account is not active. Please contact support.' });
        }

        // Delete any existing OTPs for this email and purpose
        await OTP.deleteMany({ email: email.toLowerCase(), purpose: 'login' });

        // Generate new OTP
        const otpCode = generateOTP();

        // Save OTP to database
        const otp = new OTP({
            email: email.toLowerCase(),
            otp: otpCode,
            purpose: 'login',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });
        await otp.save();

        // Send OTP via email
        const emailResult = await sendOTPEmail(email, otpCode, 'login');

        console.log(`📧 OTP sent to ${email}: ${otpCode}`);

        res.json({
            success: true,
            message: 'OTP sent successfully to your email',
            // In development mode, include OTP in response if email failed
            devOTP: otpCode // ALWAYS send OTP for testing purposes
        });

    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }
};

// Verify OTP and login
exports.verifyOTPAndLogin = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        // Find the OTP
        const otpRecord = await OTP.findOne({
            email: email.toLowerCase(),
            purpose: 'login',
            verified: false
        }).sort({ createdAt: -1 }); // Get the most recent one

        if (!otpRecord) {
            return res.status(404).json({ error: 'OTP not found or already used' });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        // Check attempts
        if (otpRecord.attempts >= 3) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(429).json({ error: 'Too many failed attempts. Please request a new OTP.' });
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(400).json({
                error: 'Invalid OTP',
                attemptsLeft: 3 - otpRecord.attempts
            });
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        // Get user details
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
                schoolId: user.schoolId
            },
            process.env.JWT_SECRET || 'fallback_secret_for_development_only',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Delete the used OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        console.log(`✅ User logged in successfully: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                schoolId: user.schoolId
            }
        });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Failed to verify OTP. Please try again.' });
    }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete existing OTPs
        await OTP.deleteMany({ email: email.toLowerCase(), purpose: 'login' });

        // Generate new OTP
        const otpCode = generateOTP();

        // Save new OTP
        const otp = new OTP({
            email: email.toLowerCase(),
            otp: otpCode,
            purpose: 'login',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
        await otp.save();

        // Send OTP via email
        const emailResult = await sendOTPEmail(email, otpCode, 'login');

        console.log(`📧 OTP resent to ${email}: ${otpCode}`);

        res.json({
            success: true,
            message: 'OTP resent successfully',
            ...(emailResult.otp && { devOTP: emailResult.otp })
        });

    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({ error: 'Failed to resend OTP. Please try again.' });
    }
};
