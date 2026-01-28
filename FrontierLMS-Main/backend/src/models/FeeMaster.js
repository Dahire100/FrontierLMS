const mongoose = require('mongoose');

const feeMasterSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    feeGroupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeeGroup',
        required: true
    },
    feeTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeeType',
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true // Fees are usually defined per class
    },
    type: {
        type: String, // 'Monthly', 'Yearly', 'OneTime'
        required: true,
        default: 'OneTime'
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    dueDate: {
        type: Date,
        required: true
    },
    fineType: {
        type: String,
        enum: ['none', 'percentage', 'fixed'],
        default: 'none'
    },
    fineAmount: {
        type: Number,
        default: 0
    },
    description: String
}, {
    timestamps: true
});

module.exports = mongoose.model('FeeMaster', feeMasterSchema);
