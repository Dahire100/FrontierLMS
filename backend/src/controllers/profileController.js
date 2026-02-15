// controllers/profileController.js
const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Teacher = require('../models/Teacher');
const School = require('../models/School');

// Get current user profile
exports.getMyProfile = async (req, res) => {
    const { schoolId, _id: userId, role } = req.user;

    try {
        let profile = null;
        // Always fetch user to get preferences
        const user = await User.findById(userId).select('-password');

        // Fetch profile based on role
        switch (role) {
            case 'student':
                profile = await Student.findOne({ email: req.user.email, schoolId })
                    .populate('class', 'name section')
                    .populate('schoolId', 'name address phone email logo');
                break;

            case 'teacher':
                const teacher = await Teacher.findOne({ email: req.user.email, schoolId });
                profile = teacher || user;
                break;

            case 'accountant':
            case 'librarian':
            case 'receptionist':
            case 'driver':
            case 'other':
                const staff = await Staff.findOne({ email: req.user.email, schoolId });
                profile = staff || user;
                break;

            case 'admin':
            case 'superadmin':
                profile = user;
                break;

            default:
                profile = user;
        }

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({
            role,
            profile,
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profilePicture: user.profilePicture, // Added
                preferences: user.preferences
            }
        });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Update current user profile
exports.updateMyProfile = async (req, res) => {
    const { schoolId, _id: userId, role, email: oldEmail } = req.user;
    const updates = req.body;
    const preferencesUpdate = updates.preferences;

    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.role;
    delete updates.schoolId;
    delete updates._id;
    delete updates.preferences; // Handle separately

    try {
        let updatedProfile = null;
        const emailChanged = updates.email && updates.email !== oldEmail;

        // Update User preferences if provided
        if (preferencesUpdate) {
            await User.findByIdAndUpdate(userId, { $set: { preferences: preferencesUpdate } });
        }

        // Update User basic info if provided
        if (updates.firstName || updates.lastName || updates.phone || updates.email) {
            await User.findByIdAndUpdate(userId, updates);
        }

        // Sync to role-specific models
        switch (role) {
            case 'student':
                updatedProfile = await Student.findOneAndUpdate(
                    { email: oldEmail, schoolId },
                    updates,
                    { new: true, runValidators: true }
                );
                break;

            case 'teacher':
                updatedProfile = await Teacher.findOneAndUpdate(
                    { email: oldEmail, schoolId },
                    updates,
                    { new: true, runValidators: true }
                );
                break;

            case 'accountant':
            case 'librarian':
            case 'receptionist':
            case 'driver':
                updatedProfile = await Staff.findOneAndUpdate(
                    { email: oldEmail, schoolId },
                    updates,
                    { new: true, runValidators: true }
                );
                break;

            default:
                updatedProfile = await User.findByIdAndUpdate(userId, updates, { new: true });
        }

        // Handle email change dependencies
        let message = 'Profile updated successfully';
        if (emailChanged) {
            message += '. Email updated across system. Please verify your new email.';
            // Placeholder for password regeneration trigger
            // In a real system, you might set user.mustChangePassword = true
        }

        // Refetch user 
        const updatedUser = await User.findById(userId).select('-password');

        res.json({
            message: message,
            data: updatedProfile,
            user: updatedUser
        });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Upload profile photo
exports.uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const profilePicture = `/uploads/profiles/${req.file.filename}`;
        const { _id: userId, role, email, schoolId } = req.user;

        // Update User model
        await User.findByIdAndUpdate(userId, { profilePicture });

        // Update Role-specific model
        switch (role) {
            case 'student':
                await Student.findOneAndUpdate({ email, schoolId }, { profilePicture });
                break;
            case 'teacher':
                await Teacher.findOneAndUpdate({ email, schoolId }, { profilePicture });
                break;
            case 'accountant':
            case 'librarian':
            case 'receptionist':
            case 'driver':
                await Staff.findOneAndUpdate({ email, schoolId }, { profilePicture });
                break;
        }

        res.json({
            message: 'Profile picture updated successfully',
            profilePicture: profilePicture
        });
    } catch (err) {
        console.error('Error uploading profile photo:', err);
        res.status(500).json({ error: 'Failed to upload profile photo' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    const { _id: userId } = req.user;
    const { currentPassword, newPassword } = req.body;
    const bcrypt = require('bcryptjs');

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password are required' });
    }

    try {
        // Determine which collection to check based on user type (simplified using User model for auth)
        // In this architecture, authentication happens via User model, so password is there
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash || user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid current password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);

        // Update either field depending on schema usage
        if (user.passwordHash !== undefined) {
            user.passwordHash = hashed;
        } else {
            user.password = hashed;
        }

        user.lastPasswordReset = new Date(); // Invalidate all existing sessions

        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).json({ error: 'Failed to change password' });
    }
};
