const mongoose = require('mongoose');

const incomeHeadSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Unique name per school
incomeHeadSchema.index({ schoolId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('IncomeHead', incomeHeadSchema);
