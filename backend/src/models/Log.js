const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action: {
        type: String, // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
        required: true
    },
    module: {
        type: String, // e.g., 'Student', 'Fees', 'Exam'
        required: true
    },
    description: String,
    ipAddress: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Log', logSchema);
