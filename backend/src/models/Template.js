const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    event: {
        type: String,
        required: true
    },
    templateId: {
        type: String
    },
    ivrId: {
        type: String
    },
    smsWhatsapp: {
        type: Boolean,
        default: true
    },
    email: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['System', 'Custom'],
        default: 'Custom'
    },
    category: {
        type: String,
        enum: ['SMS', 'Email', 'Notification', 'WhatsApp'],
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Template', templateSchema);
