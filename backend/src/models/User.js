const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['super_admin', 'school_admin', 'teacher', 'parent', 'student', 'staff'],
        required: true
    },
    firstName: String,
    lastName: String,
    profilePicture: String,
    phone: String,
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    canChangePassword: {
        type: Boolean,
        default: true
    },
    lastLogin: Date,
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        pushNotifications: {
            type: Boolean,
            default: true
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'light'
        },
        sidebarOpen: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
