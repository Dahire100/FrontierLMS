const mongoose = require('mongoose');

const schoolTimeSchema = new mongoose.Schema({
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
    srNo: {
        type: String,
        required: true
    },
    period: {
        type: String, // Period name or 'LUNCH BREAK' etc
        required: true
    },
    startTime: {
        type: String, // format HH:MM
        required: true
    },
    endTime: {
        type: String, // format HH:MM
        required: true
    },
    isBreak: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SchoolTime', schoolTimeSchema);
