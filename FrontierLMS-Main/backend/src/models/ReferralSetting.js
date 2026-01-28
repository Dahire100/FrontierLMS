const mongoose = require('mongoose');

const referralSettingSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String // To explain benefit/rules
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ReferralSetting', referralSettingSchema);
