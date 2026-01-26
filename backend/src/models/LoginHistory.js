const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        required: true
    },
    ipAddress: String,
    device: String,
    browser: String,
    status: {
        type: String,
        enum: ['Success', 'Failed'],
        default: 'Success'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
