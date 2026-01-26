const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
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
    allottedDays: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

leaveTypeSchema.index({ schoolId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
