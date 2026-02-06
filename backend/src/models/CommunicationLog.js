const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['email', 'sms', 'whatsapp'],
        required: true
    },
    recipient: {
        type: String, // email or phone number
        required: true
    },
    recipientName: String,
    recipientRole: String,
    title: String,
    message: String,
    status: {
        type: String,
        enum: ['sent', 'failed'],
        default: 'sent'
    },
    error: String,
    sentAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

communicationLogSchema.index({ schoolId: 1, type: 1, sentAt: -1 });

module.exports = mongoose.model('CommunicationLog', communicationLogSchema);
