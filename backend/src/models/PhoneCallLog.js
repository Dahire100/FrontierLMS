const mongoose = require('mongoose');

const phoneCallLogSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String
    },
    nextFollowUpDate: {
        type: Date
    },
    callDuration: {
        type: String
    },
    note: {
        type: String
    },
    callType: {
        type: String,
        enum: ['Incoming', 'Outgoing'],
        default: 'Incoming'
    }
}, {
    timestamps: true
});

phoneCallLogSchema.index({ schoolId: 1, date: 1 });

module.exports = mongoose.model('PhoneCallLog', phoneCallLogSchema);
