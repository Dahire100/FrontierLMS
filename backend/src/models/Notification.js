const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Can link to User, Student, Staff depending on architecture. Using ID is flexible.
        required: true
    },
    recipientModel: {
        type: String,
        enum: ['User', 'Student', 'Staff'],
        default: 'User'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error', 'alert'],
        default: 'info'
    },
    link: {
        type: String // Optional link to redirect
    },
    isRead: {
        type: Boolean,
        default: false
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
