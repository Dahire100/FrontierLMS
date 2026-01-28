const mongoose = require('mongoose');

const feeTypeSchema = new mongoose.Schema({
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
    name: {
        type: String, // e.g., "Tuition Fee", "Lab Fee"
        required: true,
        trim: true
    },
    code: {
        type: String, // e.g., "TUI", "LAB"
        required: true,
        trim: true
    },
    description: String
}, {
    timestamps: true
});

feeTypeSchema.index({ schoolId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('FeeType', feeTypeSchema);
