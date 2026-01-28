const mongoose = require('mongoose');

const voucherSettingSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    prefix: {
        type: String,
        required: true,
        uppercase: true
    },
    lastUsed: {
        type: Number,
        default: 0
    },
    digits: {
        type: Number,
        default: 4 // e.g., 0001
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: String,
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Ensure unique prefix per school
voucherSettingSchema.index({ schoolId: 1, prefix: 1 }, { unique: true });

module.exports = mongoose.model('VoucherSetting', voucherSettingSchema);
